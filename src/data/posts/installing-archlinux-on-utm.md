---
title: "Installing Arch Linux with Hyprland on UTM (M1 & x86_64) — Complete Guide for Beginners"
slug: "arch-linux-hyprland-utm"
date: "2025-09-10"
tags: [arch-linux, hyprland, utm, wayland, virtualization, macos]
categories: ["Tutorial", "Linux"]
excerpt: "A step-by-step guide to installing Arch Linux with Hyprland on UTM for macOS (Apple Silicon or Intel), including networking, user setup, and dotfiles."
readingTime: 10
featured: true
---

# Installing Arch Linux with Hyprland on UTM (M1 & x86_64) — Complete Guide for Beginners

> This guide walks you step-by-step through installing Arch Linux inside UTM on macOS (Apple Silicon or Intel), configuring networking, setting up a non-root user with sudo, and installing the Hyprland Wayland compositor with your own dotfiles.

---

## 1. Preparation

**Requirements:**
- macOS with [UTM](https://mac.getutm.app/) installed
- Arch Linux ISO (x86_64 for Intel VM, aarch64 for Apple Silicon VM)
- Basic familiarity with terminal commands
- Your dotfiles repository (optional, for personalized configs)

**Tip:** In UTM, create a virtual disk (e.g., 40GB) for the VM. After installation, ensure you boot from the virtual disk, not the ISO.

---

## 2. Booting Arch ISO in UTM

1. Create a new VM in UTM with your chosen architecture.
2. Attach the Arch Linux ISO as a CD/DVD drive.
3. Boot the VM — you should see the Arch Linux live environment.

---

## 3. Partitioning & Formatting

Inside the Arch ISO shell:

```bash
fdisk /dev/sda  # or /dev/vda depending on your VM
# Create:
#  - /dev/sda1 (EFI)   512M
#  - /dev/sda2 (root)  remaining space

mkfs.fat -F32 /dev/sda1
mkfs.ext4 /dev/sda2

Mount the partitions:
mount /dev/sda2 /mnt
mount --mkdir /dev/sda1 /mnt/boot

```

4. Installing Arch
```bash
pacstrap /mnt base linux linux-firmware
genfstab -U /mnt >> /mnt/etc/fstab
arch-chroot /mnt

Set timezone, locale, and hostname:
ln -sf /usr/share/zoneinfo/Region/City /etc/localtime
hwclock --systohc
nano /etc/locale.gen  # uncomment en_US.UTF-8 UTF-8
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
echo "myarch" > /etc/hostname
```

> Set root password:
``````
passwd
``````

> Install bootloader:
``````
pacman -S grub efibootmgr
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg
``````

> Exit chroot, unmount, and reboot:
``````
exit
umount -R /mnt
reboot
``````

5. Boot from Virtual Disk
> After reboot, remove the ISO from UTM or change the boot order to prioritize the virtual hard disk.

6. Network Configuration (No Internet Fix)
> If you encounter:
temporary failure in name resolution

> It indicates no internet connectivity.
> Enable systemd-networkd and systemd-resolved:
``````
systemctl enable --now systemd-networkd
systemctl enable --now systemd-resolved
``````
> Create a network config file:
``````
nano /etc/systemd/network/20-wired.network
``````
``````
[Match]
Name=enp0s1

[Network]
DHCP=yes
``````
> Restart networking:
``````
systemctl restart systemd-networkd
ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
``````
> Test internet:
``````
ping -c 3 archlinux.org
``````

7. Create User and Enable Sudo
> As root:
``````
pacman -S sudo
useradd -m -G wheel -s /bin/bash anvndev
passwd anvndev
EDITOR=vi visudo  # uncomment: %wheel ALL=(ALL:ALL) ALL
``````
> Switch to the user:
``````
su - anvndev
sudo whoami  # should print "root"
``````

8. Install Hyprland & Essentials
``````
sudo pacman -S --needed hyprland waybar kitty wofi xdg-desktop-portal-hyprland polkit wl-clipboard grim slurp alacritty neovim tmux picom git stow firefox
``````
> Install a display manager (GDM recommended):
``````
sudo pacman -S gdm
sudo systemctl enable gdm
``````

9. Apply Dotfiles (Optional)
> If you have dotfiles with GNU Stow:
``````
git clone https://github.com/yourusername/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
stow hyprland waybar kitty
``````
> Or run your repo’s install.sh script if it handles stow automatically.

10. Reboot into Hyprland
``````
sudo reboot
``````
> Select Hyprland in GDM’s session menu and log in.

11. Common Issues

Boots into ISO again: Remove ISO from VM settings or change boot order.
No internet: Ensure systemd-networkd and systemd-resolved are enabled; check /etc/systemd/network/ configs.
User not in sudoers: Add to wheel group and update visudo as shown above.


Conclusion
You now have a fully functional Arch Linux + Hyprland setup inside UTM on macOS. Customize your Waybar, Hyprland configs, and other tools to match your workflow.
Happy hacking!

**Written by:** [andev0x](https://github.com/andev0x)
**Last updated:** September 10, 2025

