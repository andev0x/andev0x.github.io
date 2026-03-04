---
title: "From VS Code to Ghostty + Neovim + Tmux — A Minimalist Developer Workflow"
slug: "ghostty-neovim-tmux-workflow"
date: "2026-03-04"
tags: [neovim, tmux, ghostty, terminal, workflow, linux, macos, opensource]
categories: ["Workflow", "Developer Experience"]
excerpt: "A personal journey from full-featured IDEs to a terminal-first workflow powered by Ghostty, Neovim, and Tmux — built for performance, control, and open-source contribution."
readingTime: 10
featured: true
---

# From VS Code to Ghostty + Neovim + Tmux — A Minimalist Developer Workflow

> This article shares my journey from GUI-heavy IDEs to a terminal-first workflow powered by Ghostty, Neovim, and Tmux — focused on performance, control, and building tools for the open-source community.


## 1. Where It Started — VS Code & Traditional IDEs

Like many developers, I began with **VS Code** and language-specific IDEs (especially for Go).

They offered:

- Instant productivity
- Rich plugin ecosystems
- Built-in debugging
- Excellent LSP support

And honestly — they worked great.

But over time, I started noticing something:

- Too much abstraction.
- Limited control over deeper layers.
- Increasing dependency on GUI environments.

I wasn’t just looking for speed — I was looking for ownership of my workflow.


## 2. The Zed Phase — Performance & Rust Influence

At one point, I switched to **Zed**.

The main reason?
It’s written in Rust — a language I genuinely enjoy.

What attracted me:

- Performance-focused architecture
- Clean UI
- Modern design philosophy

I spent quite a bit of time customizing and optimizing it to fit my workflow.

But eventually I realized something important:

Performance alone wasn’t the end goal.

I wanted deeper integration with the system itself — especially as I started working more heavily on Linux.


## 3. Falling Back in Love with the Terminal

The more time I spent inside Linux environments, the more I appreciated the terminal.

The terminal is:

- Lightweight
- Distraction-free
- Composable
- Scriptable
- Predictable

It doesn’t try to abstract everything away.

It exposes the system.

That’s when I decided to seriously revisit **Neovim**.


## 4. Neovim — From Frustration to Control

I had tried configuring Neovim before.

And I quit.

Not because of Vim keybindings.

But because:

- Plugin conflicts
- Fragile configs
- Breaking changes on updates
- Poor modular structure (in my early setup)

This time, I approached it differently:

- Modular Lua configuration
- Minimal plugin philosophy
- Clean LSP abstraction
- Stable, actively maintained dependencies

After a few focused days, I built a setup supporting:

- Java
- Python
- Go
- C++
- Rust

I tested it on both Linux and macOS.
It worked consistently across environments.

That consistency was a turning point.


## 5. Adding Tmux — True Session Resilience

Once fully committed to terminal-first development, I added **Tmux** to the stack.

Why?

Because modern development requires:

- Multiple concurrent sessions
- Long-running processes
- Reliable session restoration

Tmux gave me:

- Detach / attach workflow
- Persistent sessions
- Layout control
- Protection from accidental `Cmd + Q` moments

Now my editor wasn’t just lightweight — it was resilient.


## 6. Choosing the Right Terminal — Ghostty

I tested multiple terminal emulators.

In the end, I settled on **Ghostty**.

Why Ghostty?

- Written in Zig
- Extremely lightweight
- Beautiful rendering
- Performance-oriented
- Open source

It strikes a balance between modern rendering performance and minimalist philosophy.

On Linux, I pair it with a Window Manager for clean multi-app control on a single monitor.
On macOS, it integrates seamlessly into my development workflow.

It became the final piece of the puzzle.


## 7. The Final Stack

My current setup:
- **Terminal:** Ghostty
- **Editor:** Neovim
- **Session Manager:** Tmux


This combination gives me:

- Full control over my environment
- Cross-platform consistency (Linux + macOS)
- High performance
- Zero GUI dependency
- Deep system integration
- Composable tooling

It feels intentional.


## 8. Why This Matters — Beyond Personal Preference

This transition wasn’t just about aesthetics or speed.

It was about:

- Understanding how tools actually work
- Building plugins for Neovim
- Contributing to open-source projects
- Designing developer tools from first principles

Yes, there are already many tools in the ecosystem.

But if a tool solves a real problem for me,
it may solve it for someone else too.

Open source isn’t about replacing everything.
It’s about contributing something meaningful.

Even something small.


## 9. Will I Change Again?

Maybe.

Tools evolve.
Workflows evolve.

But right now, this setup feels:

- Stable
- Efficient
- Intentional
- Enjoyable

And that matters.


## Conclusion

Moving from full-featured IDEs to a terminal-first workflow wasn’t about rejecting modern tooling.

It was about reclaiming control.

Today, I’m genuinely happy with:

**TMUX + NEOVIM + GHOSTTY**

And I’m grateful to the developers who build and maintain these tools with passion and dedication.

If you're exploring ways to simplify and optimize your workflow —
maybe this combination is worth experimenting with.


**Written by:** [andev0x](https://github.com/andev0x)
**Last updated:** March 4, 2026
