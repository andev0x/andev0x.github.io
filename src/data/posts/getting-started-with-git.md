---
title: "Getting Started with Git: A Beginner-Friendly Guide"
slug: "getting-started-with-git"
date: "2025-07-01"
author: "andev0x"
tags: ["git", "version-control", "beginner"]
categories: ["Code", "Tools"]
excerpt: "A concise and beginner-friendly guide to understanding and using Git, the essential tool for version control in software development."
readingTime: 1
featured: false
---

**Git is the backbone of modern software collaboration. Whether you're a solo coder or part of a team, knowing Git is essential.**

## _What is Git?_

**Git** is a free and open-source distributed version control system. It helps you track changes, collaborate with others, and revert to previous versions of your code — from small personal projects to large-scale systems.

## Installing Git

- **macOS:**

```bash
  brew install git
```

- **Ubuntu/Debian:**

```bash
  sudo apt update
  sudo apt install git
```

* **Windows:**
  Download and install from [https://git-scm.com/download/win](https://git-scm.com/download/win)

## Basic Configuration

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global init.defaultBranch main
git config --list
```

## Starting a Project with Git

```bash
git init                          # Initialize a local Git repo
git add .                         # Add all files to staging
git commit -m "Initial commit"    # Make your first commit
```

## Working with Git Remotes

1. Create a new repository on GitHub
2. Link it to your local repo:

   ```bash
   git remote add origin https://github.com/yourusername/repo.git
   git push -u origin main
   ```

## Daily Git Commands

| Task                   | Command                              |
| ---------------------- | ------------------------------------ |
| Check status           | `git status`                         |
| View history           | `git log`                            |
| Create new branch      | `git branch new-feature`             |
| Switch branch          | `git checkout new-feature`           |
| Create & switch branch | `git checkout -b bugfix/login-issue` |
| Merge branch           | `git merge new-feature`              |
| See diff before commit | `git diff`                           |

## Collaborating with Others

* Clone a repository:

  ```bash
  git clone https://github.com/username/repo.git
  ```

* Pull the latest changes:

  ```bash
  git pull origin main
  ```

* Resolve merge conflicts:

  1. Edit the conflicting files
  2. Stage the resolved file:

     ```bash
     git add conflict-file.js
     git commit -m "Resolved merge conflict"
     ```

## Bonus Tips

* Undo last commit but keep changes:

  ```bash
  git reset --soft HEAD~1
  ```

* Unstage a file:

  ```bash
  git reset filename.txt
  ```

* View history of a file:

  ```bash
  git log -- filename.txt
  ```

## Resources

* [Official Git Documentation](https://git-scm.com/doc)
* [Pro Git Book](https://git-scm.com/book/en/v2)
* [GitHub Docs](https://docs.github.com/)

## Final Thoughts

Git may feel overwhelming at first, but with daily usage, it becomes a natural part of your workflow. Start small by version-controlling your personal projects, and build your confidence step by step. Happy coding! 🚀 


## Happy debugging! 🐞

**Written by:** [andev0x](https://github.com/andev0x)  
**Last updated:** July 1, 2025  