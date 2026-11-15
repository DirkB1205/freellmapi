#!/usr/bin/env python3
"""
Runtime utilities for ECC Dashboard.
Provides cross-platform terminal launching and window management.
"""

import os
import sys
import subprocess
import tkinter as tk
from typing import Optional


def maximize_window(window) -> None:
    """
    Maximize the given Tkinter window cross-platform.

    Args:
        window: A tkinter.Tk or tkinter.Toplevel instance.

    Example:
        >>> import tkinter as tk
        >>> root = tk.Tk()
        >>> maximize_window(root)  # Does not raise
        >>> root.destroy()
    """
    try:
        # Windows / Linux (X11)
        window.state("zoomed")
    except tk.TclError:
        try:
            # macOS / some Linux WMs
            window.attributes("-zoomed", True)
        except tk.TclError:
            # Fallback: manual geometry
            window.update_idletasks()
            w = window.winfo_screenwidth()
            h = window.winfo_screenheight()
            window.geometry(f"{w}x{h}+0+0")


def launch_terminal(path: str) -> None:
    """
    Launch a terminal at the given path, cross-platform.

    Args:
        path: Directory path to open the terminal in.

    Raises:
        FileNotFoundError: If no supported terminal is found.
        OSError: If the terminal command fails.

    Example:
        >>> import tempfile
        >>> with tempfile.TemporaryDirectory() as d:
        ...     launch_terminal(d)  # May open a terminal window
    """
    if not os.path.isdir(path):
        raise FileNotFoundError(f"Path is not a directory: {path}")

    system = sys.platform

    if system == "win32":
        # Windows: prefer wt (Windows Terminal), fallback to cmd
        for cmd in (["wt", "-d", path], ["cmd", "/k", "cd /d", path]):
            try:
                subprocess.Popen(cmd, start_new_session=True)
                return
            except FileNotFoundError:
                continue
        raise FileNotFoundError("No supported terminal found (wt, cmd)")

    elif system == "darwin":
        # macOS: Terminal.app
        script = f'tell application "Terminal" to do script "cd {path}"'
        subprocess.Popen(["osascript", "-e", script], start_new_session=True)

    else:
        # Linux/Unix: try common terminals
        for cmd in (
            ["gnome-terminal", "--working-directory", path],
            ["konsole", "--workdir", path],
            ["xfce4-terminal", "--working-directory", path],
            ["alacritty", "--working-directory", path],
            ["kitty", "--directory", path],
            ["terminator", "--working-directory", path],
            ["xterm", "-e", f"cd {path} && bash"],
        ):
            try:
                subprocess.Popen(cmd, start_new_session=True)
                return
            except FileNotFoundError:
                continue
        raise FileNotFoundError("No supported terminal found (gnome-terminal, konsole, xfce4-terminal, alacritty, kitty, terminator, xterm)")