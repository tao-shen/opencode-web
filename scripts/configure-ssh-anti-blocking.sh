#!/bin/bash
# SSH Anti-blocking configuration for Oracle Cloud VM

set -e

echo "🔧 Configuring SSH anti-blocking mechanisms..."

# 1. Configure SSHD to prevent connection timeouts
sudo tee /etc/ssh/sshd_config.d/anti-timeout.conf > /dev/null <<'EOF'
# Prevent SSH connection timeouts
ClientAliveInterval 30
ClientAliveCountMax 3
TCPKeepAlive yes

# Longer timeouts for ControlMaster
LoginGraceTime 120
MaxSessions 50
MaxStartups 100
EOF

# 2. Configure system-level TCP keepalive
echo "🌐 Configuring system TCP keepalive..."
sudo tee /etc/sysctl.d/99-ssh-keepalive.conf > /dev/null <<'EOF'
net.ipv4.tcp_keepalive_time = 30
net.ipv4.tcp_keepalive_intvl = 15
net.ipv4.tcp_keepalive_probes = 5
EOF
sudo sysctl -p /etc/sysctl.d/99-ssh-keepalive.conf

# 3. Create SSH client config on server (for outbound connections)
mkdir -p ~/.ssh
tee ~/.ssh/config > /dev/null <<'EOF'
Host *
    ServerAliveInterval 30
    ServerAliveCountMax 3
    TCPKeepAlive yes
    ControlMaster auto
    ControlPath ~/.ssh/sockets/%r@%h-%p
    ControlPersist 600
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    LogLevel ERROR
EOF

# 4. Create systemd service for auto-restarting cloudflared
if [ -f /etc/systemd/system/cloudflared.service ]; then
    echo "☁️  Configuring cloudflared service..."
    sudo sed -i 's/Restart=always/Restart=always\nRestartSec=5/' /etc/systemd/system/cloudflared.service
    sudo systemctl daemon-reload
fi

# 5. Create systemd service for auto-restarting opencode container
sudo tee /etc/systemd/system/opencode.service > /dev/null <<'EOF'
[Unit]
Description=OpenCode Server
After=docker.service
Requires=docker.service

[Service]
Type=simple
Restart=always
RestartSec=5
ExecStart=/usr/bin/docker start -a opencode
ExecStop=/usr/bin/docker stop -t 30 opencode

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable opencode.service 2>/dev/null || true

# 6. Add cron job to auto-restart docker if memory is critical
echo "⏰ Setting up memory monitor..."
(crontab -l 2>/dev/null || true; echo "*/5 * * * * free | awk '/Mem/{if(\$3/\$2 > 0.95) print \"Memory critical: \" \$3/\$2*100 \"%\", date \"\\\"+%Y-%m-%d %H:%M:%S\\\"\"}' >> /tmp/memory.log 2>&1") | crontab -

# 7. Restart SSH service to apply new settings
echo "🔄 Restarting SSH service..."
sudo systemctl restart sshd

echo "✅ SSH anti-blocking configuration complete!"
echo ""
echo "Configured:"
echo "  - SSHD: ClientAliveInterval=30s, ClientAliveCountMax=3"
echo "  - System: TCP keepalive enabled"
echo "  - SSH Client: ControlMaster with 10min persistence"
echo "  - Auto-restart: opencode container service"
echo "  - Monitoring: Memory usage logger (every 5min)"
