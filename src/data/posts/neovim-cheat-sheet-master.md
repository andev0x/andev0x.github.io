---
title: "Neovim Cheat Sheet Master: Complete Guide to Modern Text Editing"
slug: "neovim-cheat-sheet-master"
date: "2026-04-17"
tags: [neovim, vim, text-editor, productivity, cheat-sheet]
categories: ["Guides", "Tools"]
excerpt: "A comprehensive neovim cheat sheet covering essential commands, navigation, editing, buffers, splits, and advanced workflows to master the modern text editor."
readingTime: 11
featured: false
---
# Neovim Cheat Sheet Master: Complete Guide to Modern Text Editing

> Neovim is a modern, extensible text editor that builds on Vim's strengths with better defaults, a powerful plugin system, and embedded Lua scripting. This master cheat sheet covers everything from basics to advanced workflows.

## What is Neovim?

**Neovim** is an improved version of Vim featuring:
- Modern plugin architecture (using Lua)
- Better default settings
- Asynchronous job control
- Built-in LSP client support
- Terminal emulator
- Remote plugin support

## Installation

```bash
# macOS (Homebrew)
brew install neovim

# Ubuntu/Debian
sudo apt install neovim

# Fedora
sudo dnf install neovim

# Build from source
git clone https://github.com/neovim/neovim
cd neovim && make CMAKE_BUILD_TYPE=Release
sudo make install
```

## Modes

Neovim has several modes:

| Mode | Key | Purpose |
|------|-----|---------|
| Normal | `Esc` | Navigate and edit |
| Insert | `i`, `a`, `o` | Insert text |
| Visual | `v` | Select text |
| Visual Line | `V` | Select entire lines |
| Visual Block | `Ctrl+v` | Select rectangular regions |
| Command | `:` | Execute commands |
| Replace | `R` | Replace characters |

## Essential Navigation

### Character Navigation

| Command | Description |
|---------|-------------|
| `h`, `j`, `k`, `l` | Move left, down, up, right |
| `w` | Move to start of next word |
| `W` | Move to start of next WORD (space-separated) |
| `e` | Move to end of word |
| `E` | Move to end of WORD |
| `b` | Move to start of previous word |
| `B` | Move to start of previous WORD |
| `0` | Move to beginning of line |
| `^` | Move to first non-blank character |
| `$` | Move to end of line |
| `g_` | Move to last non-blank character |

### Jumping

| Command | Description |
|---------|-------------|
| `gg` | Go to start of file |
| `G` | Go to end of file |
| `:[line]` | Go to specific line |
| `Ctrl+f` | Page down |
| `Ctrl+b` | Page up |
| `Ctrl+d` | Scroll down half page |
| `Ctrl+u` | Scroll up half page |
| `%` | Jump to matching bracket/paren |
| `gd` | Go to definition (with LSP) |
| `gD` | Go to declaration |

## Searching and Replacing

### Search

| Command | Description |
|---------|-------------|
| `/pattern` | Search forward |
| `?pattern` | Search backward |
| `n` | Next match |
| `N` | Previous match |
| `*` | Search for word under cursor (forward) |
| `#` | Search for word under cursor (backward) |
| `Ctrl+l` | Clear search highlight |

### Find and Replace

| Command | Description |
|---------|-------------|
| `:s/old/new` | Replace in current line |
| `:s/old/new/g` | Replace all in current line |
| `:%s/old/new/g` | Replace all in file |
| `:1,10s/old/new/g` | Replace in lines 1-10 |
| `:.,.+5s/old/new/g` | Replace current line and 5 below |
| `:s/old/new/gc` | Replace with confirmation |

## Editing Commands

### Insert Text

| Command | Description |
|---------|-------------|
| `i` | Insert before cursor |
| `I` | Insert at line start |
| `a` | Append after cursor |
| `A` | Append at line end |
| `o` | Create new line below |
| `O` | Create new line above |
| `gi` | Go to last insert position and insert |

### Delete and Change

| Command | Description |
|---------|-------------|
| `x` | Delete character under cursor |
| `X` | Delete character before cursor |
| `d[motion]` | Delete based on motion |
| `dd` | Delete entire line |
| `D` | Delete to end of line |
| `c[motion]` | Change (delete and insert) |
| `cc` | Change entire line |
| `C` | Change to end of line |
| `s` | Substitute character (delete and insert) |
| `S` | Substitute line |

### Copy and Paste

| Command | Description |
|---------|-------------|
| `y[motion]` | Yank (copy) |
| `yy` | Yank entire line |
| `Y` | Yank to end of line |
| `p` | Paste after cursor |
| `P` | Paste before cursor |
| `]p` | Paste with indentation |
| `"[a-z]y` | Yank into register a-z |
| `"[a-z]p` | Paste from register a-z |

### Undo and Redo

| Command | Description |
|---------|-------------|
| `u` | Undo |
| `Ctrl+r` | Redo |
| `U` | Undo all changes in line |
| `:undolist` | Show undo tree |
| `:earlier [time]` | Go to earlier state |
| `:later [time]` | Go to later state |

## Text Objects

Text objects enable powerful editing with `d`, `c`, `y`, `v`:

| Object | Description |
|--------|-------------|
| `w` | Word |
| `W` | WORD (space-separated) |
| `s` | Sentence |
| `p` | Paragraph |
| `t` | Tag/HTML element |
| `"` | Quoted string |
| `'` | Single-quoted string |
| `` ` `` | Backtick-quoted string |
| `(` or `)` | Parentheses block |
| `{` or `}` | Braces block |
| `[` or `]` | Brackets block |
| `<` or `>` | Angle brackets block |

### Examples

```
di"    Delete inside quotes
ca)    Change around parentheses
yip    Yank inside paragraph
vit    Select inside tag
```

## Visual Mode

| Command | Description |
|---------|-------------|
| `v` | Character-wise visual mode |
| `V` | Line-wise visual mode |
| `Ctrl+v` | Block-wise visual mode |
| `o` | Jump to other end of selection |
| `O` | Jump to other corner (block mode) |
| `gv` | Reselect previous visual selection |

## Registers and Marks

### Registers

| Command | Description |
|---------|-------------|
| `:registers` | Show all registers |
| `"[a-z]y` | Yank into register a-z |
| `"[a-z]p` | Paste from register |
| `"+y` | Yank to system clipboard |
| `"+p` | Paste from system clipboard |
| `"_y` | Yank to black hole (discard) |

### Marks

| Command | Description |
|---------|-------------|
| `m[a-z]` | Set local mark |
| `m[A-Z]` | Set global mark |
| `'[a-z]` | Jump to mark |
| `` `[a-z] `` | Jump to exact mark position |
| `''` | Jump to previous position |
| `:marks` | Show all marks |

## Buffers

### Buffer Navigation

| Command | Description |
|---------|-------------|
| `:e [file]` | Edit file |
| `:edit [file]` | Open file in current buffer |
| `:e #` | Switch to alternate buffer |
| `:ls` or `:buffers` | List all buffers |
| `:b [number/name]` | Switch to buffer |
| `:bn` | Next buffer |
| `:bp` | Previous buffer |
| `:bd` | Delete buffer |
| `:q` | Quit (close buffer) |
| `:qa` | Quit all |
| `:wq` or `:x` | Write and quit |

### Buffer Management

| Command | Description |
|---------|-------------|
| `:badd [file]` | Add buffer without opening |
| `:bwipe` | Wipe buffer from memory |
| `:vsplit [file]` | Open in vertical split |
| `:split [file]` | Open in horizontal split |
| `:tabedit [file]` | Open in new tab |

## Windows and Splits

### Creating Splits

| Command | Description |
|---------|-------------|
| `:split` | Horizontal split |
| `:vsplit` | Vertical split |
| `:new` | New horizontal split |
| `:vnew` | New vertical split |
| `Ctrl+w s` | Split horizontally |
| `Ctrl+w v` | Split vertically |
| `Ctrl+w n` | New window |

### Window Navigation

| Command | Description |
|---------|-------------|
| `Ctrl+w h/j/k/l` | Move to window (left/down/up/right) |
| `Ctrl+w w` | Next window |
| `Ctrl+w W` | Previous window |
| `Ctrl+w p` | Previous active window |
| `Ctrl+w t` | Top-left window |
| `Ctrl+w b` | Bottom-right window |

### Window Management

| Command | Description |
|---------|-------------|
| `Ctrl+w c` | Close window |
| `Ctrl+w o` | Close other windows |
| `Ctrl+w =` | Equalize window sizes |
| `Ctrl+w _` | Maximize window height |
| `Ctrl+w \|` | Maximize window width |
| `Ctrl+w +/-` | Increase/decrease height |
| `Ctrl+w >/< ` | Increase/decrease width |
| `Ctrl+w r` | Rotate windows |
| `Ctrl+w x` | Exchange windows |

## Tabs

| Command | Description |
|---------|-------------|
| `:tabnew [file]` | New tab |
| `:tabedit [file]` | Edit file in new tab |
| `:tabclose` | Close tab |
| `:tabonly` | Close other tabs |
| `gt` | Next tab |
| `gT` | Previous tab |
| `[n]gt` | Go to tab n |
| `:tabs` | List all tabs |

## Command Mode

| Command | Description |
|---------|-------------|
| `:` | Enter command mode |
| `:help [topic]` | Open help |
| `:set option` | Set option |
| `:set no[option]` | Unset option |
| `:set option?` | Show option value |
| `:set option=value` | Set option to value |
| `:!command` | Execute shell command |
| `:read !command` | Insert command output |
| `:version` | Show version info |

## Useful Settings

Add to `~/.config/nvim/init.vim` or `init.lua`:

```vim
" Line numbers
set number
set relativenumber

" Indentation
set autoindent
set expandtab
set tabstop=4
set shiftwidth=4

" Search
set ignorecase
set smartcase
set incsearch
set hlsearch

" UI
set cursorline
set colorcolumn=80
set textwidth=80

" Completion
set completeopt=menuone,noselect

" File handling
set undofile
set backup
set swapfile

" Performance
set lazyredraw
set timeoutlen=1000
set ttimeoutlen=0

" Appearance
set background=dark
set termguicolors
```

## Advanced Workflows

### Working with Large Files

```
gg              Go to start
G               Go to end
[n]G            Go to line n
Ctrl+g          Show current line

:1,100y         Yank lines 1-100
:.,.+50         Current line and 50 below
```

### Macro Recording

| Command | Description |
|---------|-------------|
| `q[a-z]` | Start recording to register |
| `q` | Stop recording |
| `@[a-z]` | Execute macro |
| `@@` | Repeat last macro |
| `[n]@[a-z]` | Execute macro n times |

### Global Commands

```
:global /pattern/ command    Execute command on matching lines
:g /TODO/ d                  Delete all lines with TODO
:g! /exclude/ d              Delete all lines NOT matching
```

### Folding

| Command | Description |
|---------|-------------|
| `zf[motion]` | Create fold |
| `zd` | Delete fold |
| `zo` | Open fold |
| `zc` | Close fold |
| `za` | Toggle fold |
| `zM` | Close all folds |
| `zR` | Open all folds |

## Plugin Management

Neovim uses plugin managers like `packer.nvim` or `vim-plug`:

```lua
-- Using packer.nvim
require('packer').startup(function(use)
  use 'wbthomason/packer.nvim'
  use 'nvim-treesitter/nvim-treesitter'
  use 'neovim/nvim-lspconfig'
  use 'hrsh7th/nvim-cmp'
end)
```

## Terminal Mode

| Command | Description |
|---------|-------------|
| `:terminal` | Open terminal |
| `:term [command]` | Open terminal and run command |
| `Ctrl+\Ctrl+n` | Exit terminal mode |
| `Ctrl+\ Ctrl+\ ` | Send Ctrl+\ to terminal |

## LSP Integration

Modern neovim configs include LSP for code intelligence:

```
gd              Go to definition
gr              Go to references
K               Show documentation
<leader>ca      Code action
<leader>rn      Rename symbol
```

## Performance Tips

1. Use lazy loading for plugins
2. Limit treesitter languages
3. Use efficient keybindings
4. Profile startup with `:profile start profiling.log`
5. Disable unnecessary plugins

## Helpful Resources

- [Neovim Official Docs](https://neovim.io/doc/)
- [Neovim GitHub](https://github.com/neovim/neovim)
- [VimAwesome](https://vimawesome.com/) - Plugin directory
- [Awesome Neovim](https://github.com/rockerBOO/awesome-neovim)
- [Vim Tips Wiki](https://vim.fandom.com/wiki/Vim_Tips_Wiki)

## Pro Tips

1. **Use relative line numbers** - Better for jumping to nearby lines
2. **Master text objects** - They enable powerful editing patterns
3. **Customize keybindings** - Adapt neovim to your workflow
4. **Learn LSP basics** - Modern code editing depends on it
5. **Use macros** - Automate repetitive editing tasks
6. **Explore plugins** - But keep config minimal
7. **Practice daily** - Muscle memory is key to speed

## Comparison: Vim vs Neovim

| Feature | Vim | Neovim |
|---------|-----|--------|
| Configuration | VimScript | VimScript + Lua |
| Plugin API | Limited | Modern, async |
| LSP | None native | Built-in |
| Terminal | Limited | Full integration |
| Community | Mature | Growing |
| Performance | Good | Excellent |

## Conclusion

Neovim is a powerful, modern text editor that rewards practice and customization. Start with basic navigation and editing, gradually incorporate more advanced features, and customize it to match your workflow. Whether you're editing configuration files or writing large codebases, mastering neovim makes you significantly more productive at the terminal.

Keep this cheat sheet handy, practice daily, and soon neovim keybindings will become second nature. Happy editing!

---

**Written by:** [andev0x](https://github.com/andev0x)  
**Last updated:** April 17, 2026
