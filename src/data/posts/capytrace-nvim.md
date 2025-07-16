---
title: "Introducing capytrace.nvim: Streamline Debugging in Neovim"
slug: "capytrace-nvim-debugging"
date: "2025-07-15"
tags: [neovim, debugging, open-source, vim]
categories: ["Project", "Neovim"]
excerpt: "Explore capytrace.nvim, a lightweight Neovim plugin that logs debugging sessions into Markdown or JSON timelines, perfect for tracing and resuming your work."
readingTime: 6
featured: true
---


# 🚀 Introducing capytrace.nvim: Streamline Debugging in Neovim

Debugging in Neovim can be a whirlwind of commands, edits, and fleeting ideas. That’s why I created capytrace.nvim, a lightweight, open-source plugin that captures your debugging sessions into structured Markdown or JSON timelines. Whether you're hunting bugs or switching devices, capytrace.nvim keeps your workflow organized and resumable. Let’s dive in!

# **🎯 Goals**
capytrace.nvim is designed to make debugging in Neovim intuitive and efficient. Its core goals are:

✅ Automated Logging: Capture terminal commands, file edits, and LSP diagnostics in real-time.

🔄 Context Resumption: Seamlessly resume sessions across machines.

📝 Flexible Exports: Save sessions as Markdown for readability or JSON for integration.

⚡️ Lightweight Design: Built with Go and Lua, optimized for speed and Lazy.nvim compatibility.



# **🛠️ What is capytrace.nvim?**
capytrace.nvim is a hybrid Neovim plugin that records your debugging workflow—terminal commands, file changes, cursor movements, LSP diagnostics, and more—into a timestamped timeline. With a Go backend for performance and a Lua frontend for Neovim integration, it’s perfect for developers who want to review or share their debugging process.

**Key Features**

- *Context-Aware Logging:* Tracks file edits, Git diffs, and terminal commands.
- *Live Session Recording:* Captures breakpoints, LSP diagnostics, and cursor movements.
- *Annotations:* Add notes with :CapyTraceAnnotate to document ideas or TODOs.
- *Structured Outputs:* Exports sessions as Markdown or JSON with timestamps.
- *Session Resumption:* Restart sessions with :CapyTraceResume.
- *Lazy.nvim Compatible:* Integrates smoothly with modern Neovim setups.

>_

💡 **Why I Built It**
- As a Neovim user, I often lost track of debugging steps—commands I ran, files I edited, or hypotheses I tested. Existing tools felt clunky or lacked context, so I built capytrace.nvim to automate session tracking, allow annotations, and enable resuming work anywhere. It’s about making debugging less chaotic and more collaborative.

🧭 **How It Works**
*capytrace.nvim uses a Lua frontend to handle Neovim events and a Go backend for efficient session management. Here’s the flow:*

- Start a Session: Run *:CapyTraceStart* [project_name] to begin tracking.
- Debug Naturally: The plugin logs file edits, terminal commands, and more.
- Annotate: Use *:CapyTraceAnnotate [note]* to capture thoughts.
- Export or Resume: End with *:CapyTraceEnd* to save as *Markdown/JSON*, or resume with *:CapyTraceResume [session_name]*.

### Example Markdown output:

```markdown
# Debug Session: 1704067200_myproject

**Started:** 2024-01-01T10:00:00Z
**Ended:** 2024-01-01T11:30:00Z

## Timeline

### 10:05:23 - File Edit
📄 **File:** `src/auth.lua`
📍 **Position:** Line 45, Column 12

### 10:07:15 - Terminal Command

```

```bash
git log --oneline -10
```

```
10:10:30 - Note
📝 Found potential issue in authentication logic
```

## 📦 Get Started

Install with [Lazy.nvim](https://github.com/folke/lazy.nvim):


```lua
{
  "andev0x/capytrace.nvim",
  build = "make", -- Optional: for Go binary
  config = function()
    require("capytrace").setup({
      output_format = "markdown", -- or "json"
      save_path = "~/capytrace_logs/",
    })
  end,
}
```

Or build from source:
```
git clone https://github.com/andev0x/capytrace.nvim.git
cd capytrace.nvim
make go-mod-init
make build
```

Note: Requires Go (go version) for building from source.

🤝 **Join the Community**
capytrace.nvim is open-source, and I’d love your help to make it better! Here’s how you can get involved:

Try It: Install the plugin and test it in your workflow.
Star It: If you find capytrace.nvim helpful, a ⭐ on GitHub would be awesome!
Share Feedback: Have ideas or bugs? Open an issue on GitHub.
Contribute Code: Pull requests for features or fixes are welcome—check the Contributing Guide.
Support Development: If you’d like to support the project, consider GitHub Sponsors or Buy Me a Coffee.

🌟 **What’s Next?**
With community input, I’m exploring features like enhanced LSP integration, custom export formats, and collaborative debugging tools. What would you like to see in capytrace.nvim? Share your ideas in the comments or on GitHub!
Thanks for exploring capytrace.nvim. Let’s make debugging in Neovim smoother together! 🚀

[![Neovim](https://img.shields.io/badge/link-capytrace.nvim-blue)](https://github.com/andev0x/capytrace.nvim)

**Written by:** [andev0x](https://github.com/andev0x)  
**Last updated:** July 16, 2025  