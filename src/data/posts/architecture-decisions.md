---
title: "Architecture Decisions"
slug: "architecture-decisions"
date: "2026-04-05"
tags: [architecture, decisions, technical]
categories: ["Architecture"]
excerpt: "Key architectural decisions and trade-offs made when building this knowledge system."
readingTime: 1
featured: false
---
# Architecture Decisions

> Key architectural decisions and trade-offs made when building this knowledge system.

## Context

Every system involves trade-offs. This document explains the key decisions made in building this knowledge system.

## Decision 1: MDX as Source of Truth

### Problem

We needed a content format that is:
- Human readable and writable
- Version control friendly
- Portable and future-proof
- Extensible when needed

### Approach

We chose MDX (Markdown + JSX) because it satisfies all requirements while allowing component embedding when necessary.

### Trade-offs

- No visual editor (by design)
- Requires developer tooling knowledge
- Build step required for content changes

## Decision 2: Client-side Search with FlexSearch

### Problem

Search needs to be fast, work offline, and not require external services.

### Approach

FlexSearch provides extremely fast client-side search. The index is built at build-time and loaded as a compact JSON file.

### Trade-offs

- Index size grows with content
- No fuzzy matching across documents
- Limited to text search (no semantic search)

## Decision 3: Zustand for State Management

### Problem

Keyboard-driven UI requires coordinated state across components for:
- Current selection
- UI mode (normal, search, command)
- Navigation history

### Approach

Zustand provides minimal, hook-based state management without boilerplate.

### Trade-offs

- Global state requires careful management
- State shape must be designed upfront
- Debugging requires Zustand devtools

## Decision 4: Static Site Generation

### Problem

Content rarely changes at runtime. We want maximum performance and zero infrastructure.

### Approach

Next.js static export generates HTML at build time. Pages load instantly with no server required.

### Trade-offs

- Requires rebuild for content changes
- No dynamic features without client-side code
- Preview requires local development server

## TL;DR

MDX for content, FlexSearch for search, Zustand for state, SSG for performance. All choices optimize for speed and simplicity.

---

**Written by:** [andev0x](https://github.com/andev0x)  
**Last updated:** April 5, 2026
