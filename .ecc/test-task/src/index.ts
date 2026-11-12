// Absichtlicher Fehler: Zuweisung eines Strings an eine Zahl (strict mode)
const greeting: string = "Hallo Welt";
const counter: number = greeting; // Typfehler!