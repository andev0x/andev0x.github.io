---
title: "Tmux Cheat Sheet: Master Terminal Multiplexing"
slug: "tmux-cheat-sheet"
date: "2026-04-17"
tags: [tmux, terminal, productivity, cheat-sheet]
categories: ["Guides", "Tools"]
excerpt: "A comprehensive tmux cheat sheet covering essential commands, session management, window and pane operations, and advanced workflows to master terminal multiplexing."
readingTime: 6
featured: false
---
# Tmux Cheat Sheet: Master Terminal Multiplexing

> Tmux is a powerful terminal multiplexer that allows you to manage multiple terminal sessions, windows, and panes efficiently. This cheat sheet covers everything you need to become proficient with tmux.

## What is Tmux?

**Tmux** (Terminal Multiplexer) enables you to:
- Run multiple programs in one terminal
- Switch easily between programs
- Detach and reattach sessions
- Share terminals with others
- Create complex layouts with multiple panes

## Installation

```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt install tmux

# Fedora
sudo dnf install tmux
```

## Basic Concept

Tmux uses a **prefix key** (default: `Ctrl+b`) followed by a command key.

```
Prefix + Command = Action
Ctrl+b + c = Create new window
```

## Session Management

### Creating and Attaching Sessions

| Command | Description |
|---------|-------------|
| `tmux` | Start a new tmux session |
| `tmux new-session -s session-name` | Create a named session |
| `tmux new -s dev` | Create session named "dev" |
| `tmux attach -t session-name` | Attach to a session |
| `tmux attach` | Attach to the last session |
| `tmux ls` | List all sessions |
| `Ctrl+b d` | Detach from current session |

### Session Navigation

| Command | Description |
|---------|-------------|
| `tmux list-sessions` | Show all sessions |
| `tmux kill-session -t session-name` | Delete a session |
| `Ctrl+b s` | List sessions (interactive) |
| `Ctrl+b (` | Select previous session |
| `Ctrl+b )` | Select next session |

## Window Management

Windows are tabs within a session.

| Command | Description |
|---------|-------------|
| `Ctrl+b c` | Create new window |
| `Ctrl+b ,` | Rename current window |
| `Ctrl+b &` | Kill current window |
| `Ctrl+b n` | Next window |
| `Ctrl+b p` | Previous window |
| `Ctrl+b 0-9` | Jump to window number |
| `Ctrl+b l` | Toggle between windows |
| `Ctrl+b w` | List windows (interactive) |
| `Ctrl+b f` | Find window by name |

## Pane Management

Panes are splits within a window.

### Creating and Closing Panes

| Command | Description |
|---------|-------------|
| `Ctrl+b %` | Split vertically (left/right) |
| `Ctrl+b "` | Split horizontally (top/bottom) |
| `Ctrl+b x` | Kill current pane |
| `Ctrl+b !` | Convert pane to window |

### Navigating Panes

| Command | Description |
|---------|-------------|
| `Ctrl+b Arrow Keys` | Move to adjacent pane |
| `Ctrl+b o` | Toggle between panes |
| `Ctrl+b ;` | Go to last active pane |
| `Ctrl+b q` | Show pane numbers |
| `Ctrl+b q [number]` | Jump to pane by number |

### Resizing Panes

| Command | Description |
|---------|-------------|
| `Ctrl+b Ctrl+Arrow` | Resize pane |
| `Ctrl+b Alt+Arrow` | Resize pane (larger steps) |
| `Ctrl+b z` | Maximize/minimize pane (zoom) |

## Copy & Paste

### Entering Copy Mode

| Command | Description |
|---------|-------------|
| `Ctrl+b [` | Enter copy mode |
| `q` or `Esc` | Exit copy mode |
| `Space` | Start selection |
| `Enter` | Copy selection |

### Pasting

| Command | Description |
|---------|-------------|
| `Ctrl+b ]` | Paste from buffer |
| `Ctrl+b #` | List paste buffers |
| `Ctrl+b -` | Delete top paste buffer |

## Search and Movement in Copy Mode

| Command | Description |
|---------|-------------|
| `/` | Search forward |
| `?` | Search backward |
| `n` | Next match |
| `N` | Previous match |
| `g` | Go to top |
| `G` | Go to bottom |

## Common Workflows

### Development Setup

```bash
# Create a new session
tmux new-session -s dev

# In tmux, create windows
Ctrl+b c  # Main editing window
Ctrl+b c  # Server window
Ctrl+b c  # Build window

# Split panes as needed
Ctrl+b %  # Split main editor
Ctrl+b "  # Split server pane
```

### Working with Multiple Projects

```bash
# Create sessions for each project
tmux new -s project1
tmux new -s project2

# Quickly switch between projects
tmux attach -t project1
tmux attach -t project2
```

### Remote Work

```bash
# Start a detached session on remote server
tmux new-session -d -s work

# Later, connect and attach
ssh user@host
tmux attach -t work

# Disconnect without killing
Ctrl+b d

# Reconnect later
tmux attach -t work
```

## Configuration

Create or edit `~/.tmux.conf`:

```bash
# Set prefix to Ctrl+a (more convenient)
set -g prefix C-a
unbind C-b

# Enable mouse support
set -g mouse on

# Set window numbering to start at 1
set -g base-index 1
setw -g pane-base-index 1

# Automatically renumber windows
set -g renumber-windows on

# Set terminal colors
set -g default-terminal "screen-256color"

# Increase scrollback history
set -g history-limit 10000

# Faster key repeat
set -g repeat-time 1000

# Customize status bar
set -g status-bg black
set -g status-fg white
set -g status-left "[#S]"
set -g status-right "%H:%M %d-%b"

# Use vim keys for navigation
setw -g mode-keys vi
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R
```

Reload configuration:

```bash
tmux source-file ~/.tmux.conf
```

Or within tmux:

```
Ctrl+b :source-file ~/.tmux.conf
```

## Pro Tips & Tricks

### Command Mode

Access tmux command prompt:

```
Ctrl+b :  # Enter command mode
```

Useful commands:

```bash
:list-commands           # Show all commands
:list-keys              # Show all keybindings
:show-options           # Show current options
:set option value       # Set an option
```

### Synchronize Panes

Type same command in multiple panes:

```
Ctrl+b :set synchronize-panes
```

### Capture Pane Content

```bash
tmux capture-pane -t session:window -p > output.txt
```

### Send Commands to Pane

```bash
tmux send-keys -t session:window.pane "command" Enter
```

### Create Custom Shortcuts

Add to `~/.tmux.conf`:

```bash
# Quick session creation
bind S command-prompt -p "session name:" "new-session -s '%%'"

# Kill session
bind C-x kill-session -t "#{session_name}"

# New window with current path
bind c new-window -c "#{pane_current_path}"
```

### Run Commands on Startup

```bash
# Start session with layout
tmux new-session -d -s dev \
  -c ~/projects \
  -x 200 -y 50

# Create windows and send commands
tmux new-window -t dev -n editor -c ~/projects
tmux send-keys -t dev:editor "vim" Enter
```

## Debugging

### Check Configuration

```bash
tmux show-options -g           # Show global options
tmux show-options -w           # Show window options
tmux show-options -p           # Show pane options
```

### View Tmux Version

```bash
tmux -V
```

## Useful Shortcuts Summary

| Action | Shortcut |
|--------|----------|
| Detach | `Ctrl+b d` |
| List sessions | `Ctrl+b s` |
| New window | `Ctrl+b c` |
| New pane (vertical) | `Ctrl+b %` |
| Kill pane | `Ctrl+b x` |
| Zoom pane | `Ctrl+b z` |
| Rename window | `Ctrl+b ,` |
| Enter copy mode | `Ctrl+b [` |
| Paste | `Ctrl+b ]` |

## Resources

- [Official Tmux GitHub](https://github.com/tmux/tmux)
- [Tmux Manual](https://man7.org/linux/man-pages/man1/tmux.1.html)
- [Tmux Wiki](https://github.com/tmux/tmux/wiki)
- [Tmux Cheat Sheet Repo](https://github.com/tmux/tmux/wiki/Getting-Started)

## Conclusion

Tmux transforms how you work in the terminal by enabling efficient session management, powerful window organization, and seamless pane navigation. Start with the basic commands and gradually incorporate advanced workflows into your daily routine. With practice, tmux becomes an indispensable tool for terminal productivity.

---

**Written by:** [andev0x](https://github.com/andev0x)  
**Last updated:** April 17, 2026
