---
title: "How to Set Up SSH for GitHub and Remote Servers"
slug: "setup-ssh-guide"
date: "2025-07-03"
tags: [ssh, git, github, server, security, developer-tools]
categories: ["Tools"]
excerpt: "A step-by-step guide to generating, configuring, and using SSH keys for GitHub and remote server access."
readingTime: 4
featured: true
---

# 🔐 **How to Set Up SSH for GitHub and Remote Servers**

SSH (Secure Shell) is an essential tool for secure communication between your machine and remote services like GitHub, servers, and containers.

**In this guide, you'll learn:**

- How to generate SSH keys  
- How to add them to GitHub  
- How to use them with remote servers  
- How to manage multiple keys  



## **🧰 Prerequisites**

- A terminal (macOS/Linux) or Git Bash (Windows)  
- Git installed  
- A GitHub account (for Git usage)  
- Access to a remote server (optional)  



## *🗝️ Step 1: Generate SSH Key Pair*

Open your terminal and run:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

> Use `-t rsa -b 4096` if your system doesn’t support `ed25519`.  

You'll see:

```
Enter file in which to save the key (/home/you/.ssh/id_ed25519):
```

Press **Enter** to accept the default path or type a custom filename.

Next:

```
Enter passphrase (empty for no passphrase):
```

> *💡 Use a strong passphrase or leave it empty for convenience (less secure).*



## **📂 Step 2: Add SSH Key to Your SSH Agent**

Start the SSH agent:

```bash
eval "$(ssh-agent -s)"
```

Add your private key:

```bash
ssh-add ~/.ssh/id_ed25519
```

If you used a custom filename:

```bash
ssh-add ~/.ssh/your_custom_key
```



## **🖥️ Step 3: Add Public Key to GitHub**

Copy your public key to clipboard:

- macOS:
  ```bash
  pbcopy < ~/.ssh/id_ed25519.pub
  ```
- Linux:
  ```bash
  xclip -sel clip < ~/.ssh/id_ed25519.pub
  ```
- Windows (Git Bash):
  ```bash
  clip < ~/.ssh/id_ed25519.pub
  ```

*Then:*

1. Go to **GitHub → Settings → SSH and GPG keys**  
2. Click **"New SSH key"**  
3. Paste the key and give it a title  



## **✅ Step 4: Test Your Connection**

```bash
ssh -T git@github.com
```

*You should see:*

```
Hi your-username! You've successfully authenticated, but GitHub does not provide shell access.
```

If you see permission denied — make sure your public key was added correctly.



## **🌐 Step 5: Use SSH with Remote Servers**

To connect to a remote server:

```bash
ssh username@your-server-ip
```

If using a custom key:

```bash
ssh -i ~/.ssh/your_custom_key username@your-server-ip
```

You can also define this in your `~/.ssh/config` file:

```ini
Host myserver
  HostName your-server-ip
  User username
  IdentityFile ~/.ssh/your_custom_key
```

Then connect with:

```bash
ssh myserver
```



## 💡 *Bonus:* Manage Multiple SSH Keys

Use `~/.ssh/config` to manage multiple GitHub accounts or servers:

```ini
# Personal GitHub
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal

# Work GitHub
Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work
```

Then clone like this:

```bash
git clone git@github-work:your-org/your-repo.git
```



## **🔒 Security Tips**

- Never share your **private key** (`id_ed25519`)  
- Use **strong passphrases**  
- Regularly **rotate your keys**  
- Store backups securely (e.g., encrypted cloud storage or password manager)  




1. Generate SSH key → `ssh-keygen`  
2. Add to SSH agent → `ssh-add`  
3. Copy and paste public key to GitHub or remote server  
4. Test connection → `ssh -T git@github.com`  
5. Optional: Configure `~/.ssh/config` for multi-key management  



**Written by:** [andev0x](https://github.com/andev0x)  
**Last updated:** July 3, 2025  

