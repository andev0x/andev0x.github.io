---
title: "From VS Code to Ghostty + Neovim + Tmux — A Minimalist Developer Workflow"
slug: "ghostty-neovim-tmux-workflow"
date: "2026-03-04"
tags: [neovim, tmux, ghostty, terminal, workflow, linux, macos, opensource]
categories: ["Tools", "Developer Experience"]
excerpt: "A personal journey from full-featured IDEs to a terminal-first workflow powered by Ghostty, Neovim, and Tmux — built for performance, control, and open-source contribution."
readingTime: 5
featured: true
---
# From VS Code to Ghostty + Neovim + Tmux — A Minimalist Developer Workflow

> Like most developers, I started with VS Code.

It worked. It worked really well, actually. Fast setup, a rich plugin ecosystem, solid LSP support, built-in debugging — the kind of environment where you can be productive on day one without thinking too hard about tooling. For a long time, that was enough.

But somewhere along the way I started noticing a low-level friction I couldn't quite name. The tools were making decisions for me. Abstractions were accumulating between me and the actual system. The more I worked across different environments — especially Linux — the more I felt like I was operating through glass rather than directly on the machine.

I wasn't looking for a faster IDE. I was looking for ownership over my workflow.

---

## The Zed Phase

Before going full terminal, I made a stop at Zed.

The draw was partly practical — it's genuinely fast, architecturally clean, and built with a seriousness about performance that most editors lack. But honestly, part of it was that it's written in Zig... no wait, Rust — a language I'd been spending more time with and enjoying. There's something satisfying about using a tool built in a language you understand and respect.

I spent real time with it. Customized it, optimized it, shaped it to fit my workflow. And Zed delivered on its promises.

But I kept running into the same wall: the deeper I went into Linux environments, the more I wanted direct system integration rather than a modern GUI sitting above it. Performance wasn't the end goal. Control was.

---

## Falling Back in Love with the Terminal

The terminal doesn't try to abstract things away. It exposes the system — predictably, composably, without ceremony. The more time I spent in it, the more that felt like exactly what I wanted.

Lightweight. Distraction-free. Scriptable. The same everywhere.

That's when I decided to give Neovim a serious, committed attempt — not a weekend experiment.

---

## Neovim — From Frustration to Control

I want to be honest here: I had tried Neovim before and quit.

Not because of Vim keybindings. I'd made peace with those. The real friction was the configuration ecosystem: plugin conflicts, fragile setups that broke on updates, configs that weren't modular enough to reason about when something went wrong. Early Neovim configuration had a reputation for being powerful in theory and chaotic in practice, and I'd experienced that firsthand.

This time I approached it differently. I committed to a modular Lua configuration, deliberately kept the plugin count low, and built around a clean LSP abstraction. I was selective about dependencies — only stable, actively maintained ones made the cut.

After a few focused days, I had a setup that handled Java, Python, Go, C++, and Rust consistently across both Linux and macOS. That cross-environment consistency was the thing that made it stick. A configuration that breaks differently on different machines is worse than no configuration at all.

---

## Tmux — Session Resilience

Once I was committed to terminal-first development, Tmux became the obvious next piece.

Modern development involves multiple concurrent processes: a running server here, a build watching there, a REPL open somewhere else. Keeping all of that alive across disconnections, context switches, and the occasional accidental `Cmd+Q` requires something more than tabs in a terminal window.

Tmux gave me persistent sessions with reliable detach/attach workflows, flexible layout control, and the confidence that a disconnection wouldn't mean losing hours of session state. The editor became not just lightweight but resilient — which is a different and more useful property.

---

## Ghostty — The Last Piece

I went through a few terminal emulators before settling on Ghostty. The decision wasn't dramatic — most modern terminals are good enough — but Ghostty earns its place.

It's written in Zig, which gives it a performance profile and binary size that most Electron-adjacent terminals can't touch. The rendering is clean, the philosophy is minimalist, and it's fully open source. On Linux, I pair it with a tiling window manager for clean multi-app control on a single monitor. On macOS, it integrates without friction into the rest of the workflow.

It's not the most feature-rich terminal available. That's part of why I chose it.

---

## The Stack

Where I've landed:

- **Terminal:** Ghostty
- **Editor:** Neovim
- **Session Manager:** Tmux

What this combination gives me in practice: full control over the environment, consistent behavior across Linux and macOS, no GUI dependency, and tooling that composes cleanly. Nothing in the stack is doing something I don't understand or can't modify.

It feels intentional in a way that previous setups didn't — not because the tools are objectively superior to everything else, but because the whole configuration reflects deliberate choices rather than defaults accumulated over time.

---

## Why This Matters Beyond Personal Preference

I want to be careful not to oversell the terminal-first workflow as universally correct. VS Code is an excellent tool. Zed is genuinely impressive. JetBrains IDEs have capabilities that Neovim plugins replicate imperfectly or not at all. The right choice depends on what you're building, how you work, and what kind of control actually matters to you.

What this transition gave me personally was a different relationship with tools: understanding how they work rather than just using them, being able to contribute to and modify them, and approaching developer tooling from first principles when something doesn't exist or doesn't fit.

That's what led me to start building Neovim plugins and contributing to open-source projects in this space. Not to replace what exists — most of it is good — but because working at this level of the stack makes the gaps visible, and sometimes filling a gap for yourself means it gets filled for someone else too.

---

## Will I Change Again?

Probably, eventually. Tools evolve and workflows should too.

Right now, this setup is stable, efficient, and genuinely enjoyable to work in. Those three things together are harder to achieve than any one of them alone, so I'm not optimizing further just for the sake of it.

If you're feeling the same friction I felt — the abstraction accumulating, the sense of operating through glass — it might be worth spending a few days with this combination. Not to abandon your current tools forever, but to understand what the terminal-first approach actually feels like from the inside.

It's easier to make an informed choice when you've experienced both sides of it.

---

**Written by:** [andev0x](https://github.com/andev0x)  
**Last updated:** March 4, 2026
