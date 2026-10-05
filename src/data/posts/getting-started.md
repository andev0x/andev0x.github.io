---
title: "Getting Started with the Knowledge System"
slug: "getting-started"
date: "2026-04-05"
tags: [guide, basics, keyboard]
categories: ["Guides"]
excerpt: "Learn how to navigate and use this keyboard-driven knowledge base effectively."
readingTime: 1
featured: false
---
# Getting Started with the Knowledge System

> Learn how to navigate and use this keyboard-driven knowledge base effectively.

## Context

This knowledge system is designed for fast, keyboard-driven navigation. Whether you're a developer looking to quickly access documentation or a writer organizing your thoughts, this system provides a minimal yet powerful interface.

## Problem

Traditional documentation and blog platforms often prioritize mouse interactions, making navigation slow for power users who prefer keyboard shortcuts.

## Approach

We built this system with three core principles:

1. **Keyboard-first** - All major actions accessible via keyboard
2. **Content-focused** - Minimal UI chrome, maximum readability
3. **Fast search** - Client-side search that works offline

## Implementation

### Navigation

Use these keyboard shortcuts to navigate:

- `j` / `k` - Move up/down in lists
- `Enter` - Open selected item
- `Escape` - Go back / close
- `Cmd+K` - Open command palette
- `/` - Focus search

### Writing Content

All content lives in `.mdx` files with frontmatter:

```yaml
---
title: Your Post Title
description: A brief description
date: 2024-01-15
tags: [tag1, tag2]
---
```

## Trade-offs

- No rich text editor (intentional - keeps content portable)
- Requires command line for adding content
- Learning curve for keyboard shortcuts

## TL;DR

A minimal, keyboard-driven knowledge system built on MDX content, optimized for speed and readability.

## Summary

This system provides a fast, keyboard-first interface for managing and navigating structured knowledge. Content is stored as MDX files, making it portable and future-proof.

---

**Written by:** [andev0x](https://github.com/andev0x)  
**Last updated:** April 5, 2026
