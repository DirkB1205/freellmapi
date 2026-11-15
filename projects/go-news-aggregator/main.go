package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"sync"
	"sync/atomic"
	"time"
)

// CircuitBreakerState represents the state of the circuit breaker
type CircuitBreakerState int

const (
	StateClosed CircuitBreakerState = iota
	StateHalfOpen
	StateOpen
)

// CircuitBreaker implements the circuit breaker pattern
type CircuitBreaker struct {
	state          CircuitBreakerState
	failureCount   int64
	successCount   int64
	lastFailure    time.Time
	mu             sync.RWMutex

	// Configuration
	failureThreshold int
	successThreshold int
	timeout          time.Duration
}

// NewCircuitBreaker creates a new circuit breaker
func NewCircuitBreaker(failureThreshold, successThreshold int, timeout time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		state:            StateClosed,
		failureThreshold: failureThreshold,
		successThreshold: successThreshold,
		timeout:          timeout,
	}
}

// Execute runs the given function with circuit breaker protection
func (cb *CircuitBreaker) Execute(ctx context.Context, fn func() error) error {
	// Schritt 1: Check if circuit is open
	if !cb.allowRequest() {
		return fmt.Errorf("circuit breaker is open")
	}

	// Schritt 2: Execute the function
	err := fn()

	// Schritt 3: Record result
	cb.recordResult(err)

	return err
}

// allowRequest checks if a request should be allowed
func (cb *CircuitBreaker) allowRequest() bool {
	cb.mu.RLock()
	defer cb.mu.RUnlock()

	switch cb.state {
	case StateClosed:
		return true
	case StateOpen:
		// Check if timeout has passed to transition to half-open
		if time.Since(cb.lastFailure) > cb.timeout {
			cb.mu.RUnlock()
			cb.mu.Lock()
			if cb.state == StateOpen && time.Since(cb.lastFailure) > cb.timeout {
				cb.state = StateHalfOpen
				cb.successCount = 0
			}
			cb.mu.Unlock()
			cb.mu.RLock()
			return true
		}
		return false
	case StateHalfOpen:
		return true
	}
	return false
}

// recordResult records the result of an execution
func (cb *CircuitBreaker) recordResult(err error) {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	if err != nil {
		cb.failureCount++
		cb.lastFailure = time.Now()

		switch cb.state {
		case StateClosed:
			if cb.failureCount >= int64(cb.failureThreshold) {
				cb.state = StateOpen
			}
		case StateHalfOpen:
			cb.state = StateOpen
			cb.failureCount = 0
		}
	} else {
		cb.successCount++

		switch cb.state {
		case StateHalfOpen:
			if cb.successCount >= int64(cb.successThreshold) {
				cb.state = StateClosed
				cb.failureCount = 0
				cb.successCount = 0
			}
		case StateClosed:
			cb.failureCount = 0
		}
	}
}

// GetState returns the current state
func (cb *CircuitBreaker) GetState() CircuitBreakerState {
	cb.mu.RLock()
	defer cb.mu.RUnlock()
	return cb.state
}

// NewsArticle represents a news article
type NewsArticle struct {
	Title       string    `json:"title"`
	URL         string    `json:"url"`
	Source      string    `json:"source"`
	PublishedAt time.Time `json:"published_at"`
	Content     string    `json:"content"`
}

// NewsSource represents a news source configuration
type NewsSource struct {
	Name     string
	URL      string
	RateLimit time.Duration // minimum time between requests
}

// WorkerPool manages a pool of workers for fetching news
type WorkerPool struct {
	workers    int
	jobQueue   chan func()
	results    chan []NewsArticle
	wg         sync.WaitGroup
	ctx        context.Context
	cancel     context.CancelFunc
	circuitBreakers map[string]*CircuitBreaker
	mu         sync.RWMutex
}

// NewWorkerPool creates a new worker pool
func NewWorkerPool(workers int, queueSize int) *WorkerPool {
	ctx, cancel := context.WithCancel(context.Background())
	return &WorkerPool{
		workers:         workers,
		jobQueue:        make(chan func(), queueSize),
		results:         make(chan []NewsArticle, queueSize),
		ctx:             ctx,
		cancel:          cancel,
		circuitBreakers: make(map[string]*CircuitBreaker),
	}
}

// GetCircuitBreaker returns or creates a circuit breaker for a source
func (wp *WorkerPool) GetCircuitBreaker(sourceName string) *CircuitBreaker {
	wp.mu.RLock()
	cb, exists := wp.circuitBreakers[sourceName]
	wp.mu.RUnlock()

	if exists {
		return cb
	}

	wp.mu.Lock()
	defer wp.mu.Unlock()

	// Double-check after acquiring write lock
	if cb, exists = wp.circuitBreakers[sourceName]; exists {
		return cb
	}

	cb = NewCircuitBreaker(5, 3, 30*time.Second)
	wp.circuitBreakers[sourceName] = cb
	return cb
}

// Start starts the worker pool
func (wp *WorkerPool) Start() {
	for i := 0; i < wp.workers; i++ {
		wp.wg.Add(1)
		go wp.worker(i)
	}
}

// Stop stops the worker pool
func (wp *WorkerPool) Stop() {
	wp.cancel()
	close(wp.jobQueue)
	wp.wg.Wait()
	close(wp.results)
}

// worker processes jobs from the queue
func (wp *WorkerPool) worker(id int) {
	defer wp.wg.Done()
	for {
		select {
		case <-wp.ctx.Done():
			return
		case job, ok := <-wp.jobQueue:
			if !ok {
				return
			}
			job()
		}
	}
}

// Submit adds a job to the queue
func (wp *WorkerPool) Submit(job func()) {
	select {
	case wp.jobQueue <- job:
	case <-wp.ctx.Done():
	}
}

// Results returns the results channel
func (wp *WorkerPool) Results() <-chan []NewsArticle {
	return wp.results
}

// fetchNews simulates fetching news from a source with rate limiting
// Schritt 1: Check circuit breaker
// Schritt 2: Apply rate limiting
// Schritt 3: Simulate network request
// Schritt 4: Parse and return articles
func fetchNews(ctx context.Context, source NewsSource, cb *CircuitBreaker) ([]NewsArticle, error) {
	var articles []NewsArticle

	err := cb.Execute(ctx, func() error {
		// Schritt 2: Rate limiting - simulate delay
		time.Sleep(source.RateLimit)

		// Schritt 3: Simulate network request (90% success rate)
		if rand.Float32() < 0.1 {
			return fmt.Errorf("network error: failed to fetch from %s", source.Name)
		}

		// Schritt 4: Generate mock articles
		count := rand.Intn(5) + 1
		for i := 0; i < count; i++ {
			articles = append(articles, NewsArticle{
				Title:       fmt.Sprintf("%s - Article %d", source.Name, i+1),
				URL:         fmt.Sprintf("https://%s.com/article/%d", source.Name, rand.Intn(1000)),
				Source:      source.Name,
				PublishedAt: time.Now().Add(-time.Duration(rand.Intn(3600)) * time.Second),
				Content:     fmt.Sprintf("Content from %s article %d", source.Name, i+1),
			})
		}
		return nil
	})

	return articles, err
}

// NewsAggregator orchestrates fetching from multiple sources
type NewsAggregator struct {
	pool    *WorkerPool
	sources []NewsSource
}

// NewNewsAggregator creates a new news aggregator
func NewNewsAggregator(pool *WorkerPool, sources []NewsSource) *NewsAggregator {
	return &NewsAggregator{
		pool:    pool,
		sources: sources,
	}
}

// FetchAll fetches news from all sources concurrently
func (na *NewsAggregator) FetchAll(ctx context.Context) ([]NewsArticle, error) {
	var allArticles []NewsArticle
	var mu sync.Mutex
	var wg sync.WaitGroup
	errChan := make(chan error, len(na.sources))

	for _, source := range na.sources {
		wg.Add(1)
		go func(src NewsSource) {
			defer wg.Done()

			cb := na.pool.GetCircuitBreaker(src.Name)
			articles, err := fetchNews(ctx, src, cb)
			if err != nil {
				errChan <- err
				return
			}

			mu.Lock()
			allArticles = append(allArticles, articles...)
			mu.Unlock()
		}(source)
	}

	wg.Wait()
	close(errChan)

	// Collect errors
	var errs []error
	for err := range errChan {
		errs = append(errs, err)
	}

	if len(errs) > 0 {
		return allArticles, fmt.Errorf("errors occurred: %v", errs)
	}

	return allArticles, nil
}

func main() {
	rand.Seed(time.Now().UnixNano())

	// Configure news sources
	sources := []NewsSource{
		{Name: "techcrunch", URL: "https://techcrunch.com", RateLimit: 100 * time.Millisecond},
		{Name: "theverge", URL: "https://theverge.com", RateLimit: 150 * time.Millisecond},
		{Name: "arsTechnica", URL: "https://arstechnica.com", RateLimit: 200 * time.Millisecond},
		{Name: "hackernews", URL: "https://news.ycombinator.com", RateLimit: 50 * time.Millisecond},
	}

	// Create worker pool with 3 workers, queue size 10
	pool := NewWorkerPool(3, 10)
	pool.Start()
	defer pool.Stop()

	// Create aggregator
	aggregator := NewNewsAggregator(pool, sources)

	// Fetch news with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Println("Starting news aggregation...")
	articles, err := aggregator.FetchAll(ctx)
	if err != nil {
		log.Printf("Aggregation completed with errors: %v", err)
	} else {
		log.Printf("Aggregation completed successfully")
	}

	// Print results
	log.Printf("Fetched %d articles:", len(articles))
	for _, article := range articles {
		log.Printf("  - [%s] %s", article.Source, article.Title)
	}

	// Print circuit breaker states
	log.Println("\nCircuit Breaker States:")
	for _, source := range sources {
		cb := pool.GetCircuitBreaker(source.Name)
		log.Printf("  %s: %v", source.Name, cb.GetState())
	}

	// Output as JSON for verification
	jsonOut, _ := json.MarshalIndent(map[string]interface{}{
		"articles_count": len(articles),
		"articles":       articles,
	}, "", "  ")
	fmt.Println(string(jsonOut))
}