#!/bin/bash

# Auto-start bore tunnel on boot
# Run this once to enable auto-start:

# Create systemd service
cat > ~/opencode-tunnel.service << EOF
[Unit]
Description=OpenCode Secure Tunnel
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/home/ubuntu/bore local 4096 --to bore.pub:56047
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo mv ~/opencode-tunnel.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable opencode-tunnel
sudo systemctl start opencode-tunnel

echo "✅ Tunnel auto-start enabled"
systemctl status opencode-tunnel --no-pager
