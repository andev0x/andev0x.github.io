---
title: "Getting Started with Git: A Beginner-Friendly Guide"
date: 2025-07-01
author: "andev0x"
tags: [git, version-control, beginner]
categories: [Code, Tools]
---

> Git is the backbone of modern software collaboration. Whether you're a solo coder or part of a team, knowing Git is essential.

## 🚀 What is Git?

**Git** is a free and open-source distributed version control system designed to handle everything from small to very large projects with speed and efficiency. It allows you to track changes, collaborate with others, and revert to previous versions when necessary.

## 🔧 Installing Git

**macOS:** `brew install git`  
**Ubuntu/Debian:**  
```bash
sudo apt update
sudo apt install git
```  
**Windows:** Download from [https://git-scm.com/download/win](https://git-scm.com/download/win)

## 🛠️ Basic Configuration

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global init.defaultBranch main
git config --list
```

## 📁 Starting a Project with Git

1. Initialize Git in your folder: `git init`  
2. Add files to staging area: `git add filename.txt` or `git add .`  
3. Commit changes: `git commit -m "Initial commit"`

## 🔄 Working with Git Remotes

1. Create a repository on GitHub  
2. Link it to your local project:  
```bash
git remote add origin https://github.com/yourusername/repo.git
```  
3. Push your code:  
```bash
git push -u origin main
```

## ⚙️ Daily Git Commands

| Task                     | Command                               |
|--------------------------|----------------------------------------|
| Check status             | `git status`                           |
| View history             | `git log`                              |
| Create new branch        | `git branch new-feature`               |
| Switch branch            | `git checkout new-feature`             |
| Create + switch branch   | `git checkout -b bugfix/login-issue`  |
| Merge branch             | `git merge new-feature`                |
| See diff before commit   | `git diff`                             |

## 🤝 Collaborating with Others

Clone a repository: `git clone https://github.com/username/repo.git`  
Pull latest changes: `git pull origin main`  
When conflicts happen:  
1. Edit the conflicting files manually  
2. `git add conflict-file.js`  
3. `git commit -m "Resolved merge conflict"`

## 🧪 Bonus Tips

Undo last commit but keep changes: `git reset --soft HEAD~1`  
Remove file from staging: `git reset filename.txt`  
View file change history: `git log -- filename.txt`

## 📚 Resources

- [Official Git Documentation](https://git-scm.com/doc)  
- [Pro Git Book](https://git-scm.com/book/en/v2)  
- [GitHub Docs](https://docs.github.com/)

## 💡 Final Thoughts

Git may feel intimidating at first, but with practice, it becomes second nature. Start by version-controlling your personal projects, and you’ll soon appreciate the safety and flexibility it brings. Happy coding! 🚀
