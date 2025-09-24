---

title: "Installing NixOS ARM64 with Hyprland on Apple Silicon (VMware Fusion) — Complete Guide"
slug: "nixos-arm64-hyprland-apple-silicon"
date: "2025-09-24"
tags: [nixos, arm64, apple-silicon, hyprland, wayland, vmware]
categories: ["Tutorial", "Linux"]
excerpt: "Step-by-step guide to installing NixOS ARM64 on Apple Silicon with VMware Fusion, configuring partitions, setting up Hyprland, and deploying a flake-based configuration."
readingTime: 12
featured: true

---

# Installing NixOS ARM64 with Hyprland on Apple Silicon (VMware Fusion) — Complete Guide

> This guide provides a detailed walkthrough for installing NixOS ARM64 on Apple Silicon (M1/M2) using VMware Fusion, setting up partitions, enabling networking, and configuring Hyprland with a flake-based setup optimized for development.



## 1. Preparation

**Requirements:**

* macOS with [VMware Fusion](https://www.vmware.com/products/fusion.html) installed
* NixOS Minimal ISO (ARM64/aarch64)
* Basic familiarity with Linux command line
* Optional: your own flake or dotfiles repository for customization

**Tip:** Create a VM in VMware Fusion with at least **4GB RAM** and **20GB disk**. Choose **aarch64** architecture for Apple Silicon.



## 2. Booting NixOS Minimal ISO

1. Create a new VM in VMware Fusion.
2. Attach the NixOS Minimal ARM64 ISO as the boot disk.
3. Boot into the NixOS live environment.

Switch to root:

```bash
sudo -i
```

Check disk layout:

```bash
lsblk
```

On Apple Silicon with NVMe, you’ll usually see `/dev/nvme0n1`.



## 3. Partitioning & Formatting

Use `cfdisk` to create partitions:

```bash
cfdisk /dev/nvme0n1
```

Partition scheme:

* **EFI System** – 1G
* **Swap** – 4G
* **Linux filesystem** – remaining space

Format partitions:

```bash
mkfs.fat -F32 -n boot /dev/nvme0n1p1
mkswap -L swap /dev/nvme0n1p2
mkfs.ext4 -L nixos /dev/nvme0n1p3
```

Mount partitions:

```bash
mount /dev/nvme0n1p3 /mnt
mount --mkdir /dev/nvme0n1p1 /mnt/boot
swapon /dev/nvme0n1p2
```



## 4. Generate NixOS Configuration

```bash
nixos-generate-config --root /mnt
```

This creates:

* `/mnt/etc/nixos/configuration.nix`
* `/mnt/etc/nixos/hardware-configuration.nix`



## 5. Basic System Configuration

Edit `configuration.nix`:

```nix
{ config, pkgs, ... }:

{
  imports = [ ./hardware-configuration.nix ];

  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  networking.hostName = "nixos-arm64";
  time.timeZone = "Asia/Ho_Chi_Minh";

  i18n.defaultLocale = "en_US.UTF-8";

  services.xserver.enable = true;
  services.xserver.desktopManager.gnome.enable = false;
  services.xserver.displayManager.gdm.enable = false;

  users.users.anvndev = {
    isNormalUser = true;
    extraGroups = [ "wheel" "networkmanager" ];
    initialPassword = "1234";
  };

  environment.systemPackages = with pkgs; [
    vim wget curl git
  ];

  programs.zsh.enable = true;
  programs.hyprland.enable = true;

  system.stateVersion = "25.05";
}
```



## 6. Install NixOS

```bash
nixos-install
```

Set root password when prompted. Once complete:

```bash
reboot
```

Remove ISO and boot from the virtual disk.



## 7. Deploying with Flakes

Clone your flake repo:

```bash
git clone https://github.com/andev0x/fnixos.git
cd fnixos
```

Deploy with:

```bash
sudo nixos-rebuild switch --flake .#vm-m1 \
  --extra-experimental-features nix-command \
  --extra-experimental-features flakes
```

Or run the provided script:

```bash
./deploy.sh
```



## 8. Hyprland Setup

Hyprland comes pre-configured in this setup with Nord theme, Waybar, and Kitty terminal.

**Key bindings:**

* `Super + Q`: Open Kitty
* `Super + C`: Close window
* `Super + R`: Wofi launcher
* `Super + T`: Neovim in terminal
* `Super + B`: Firefox

You can customize configs in:

* `home/hypr/hyprland.conf`
* `home/waybar/config`



## 9. Development Environment

Pre-installed tools:

* Editors: Neovim, VS Code, Helix
* Languages: Go, Rust, Python, Node.js, Deno
* Git Tools: LazyGit, Delta, Gitui
* Utilities: ripgrep, fd, fzf, bat, exa, tree
* Browsers: Firefox, Chromium, Brave, Qute



## 10. Troubleshooting

**Build fails** → Check Nix version and flake compatibility.
**Display issues** → Verify VMware Fusion tools.
**No internet** → Ensure `networkmanager` or `systemd-networkd` is enabled.

Logs:

```bash
journalctl -xe
journalctl -u hyprland
```



## Conclusion

You now have a fully functional NixOS ARM64 system running on Apple Silicon via VMware Fusion, complete with Hyprland, Nord theming, and a developer-ready environment. From here, you can tweak your flake configs, extend development tools, or port this setup to bare-metal Asahi Linux.

[![Neovim](https://img.shields.io/badge/link-fnixos-blue)](https://github.com/andev0x/fnixos)



**Written by:** [andev0x](https://github.com/andev0x)
**Last updated:** September 24, 2025
