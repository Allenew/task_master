#!/bin/bash

# Exit on error
set -e

echo "Starting EC2 Setup..."

# 1. Update System
echo "Updating system packages..."
sudo yum update -y

# 2. Install Git
echo "Installing Git..."
sudo yum install git -y

# 3. Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo yum install docker -y
    sudo service docker start
    sudo usermod -a -G docker ec2-user
    echo "Docker installed."
else
    echo "Docker already installed."
fi

# 4. Install Docker Compose
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed."
else
    echo "Docker Compose already installed."
fi

# 5. Configure Swap Space (Critical for t2.micro)
# t2.micro has only 1GB RAM. Building the frontend requires more.
# We add 2GB of swap space to use disk as temporary RAM.
echo "Configuring Swap Space..."
if [ ! -f /swapfile ]; then
    sudo dd if=/dev/zero of=/swapfile bs=128M count=16
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo "/swapfile swap swap defaults 0 0" | sudo tee -a /etc/fstab
    echo "Swap file created and enabled (2GB)."
else
    echo "Swap file already exists."
fi

echo "----------------------------------------------------------------"
echo "Setup Complete!"
echo "IMPORTANT: You must LOGOUT and LOGIN again for Docker permissions to take effect."
echo "----------------------------------------------------------------"
