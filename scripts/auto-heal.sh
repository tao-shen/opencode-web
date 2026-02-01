#!/bin/bash
set -e

VM_IP="170.9.12.37"
SSH_KEY="/Users/tao.shen/Downloads/ssh-key-2026-01-31 (5).key"
MAX_RETRIES=30
RETRY_INTERVAL=30

echo "🔧 OpenCode Server Auto-Heal"
echo "=============================="
echo ""

check_server() {
    ping -c 1 -W 3 $VM_IP &>/dev/null
    return $?
}

check_https() {
    local status=$(curl -s -o /dev/null -w "%{http_code}" https://opencode.tao-shen.com/global/health 2>/dev/null)
    if [ "$status" = "200" ]; then
        return 0
    else
        return 1
    fi
}

restart_container() {
    echo "🔄 Attempting to restart OpenCode container..."
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@$VM_IP "
        docker restart opencode 2>/dev/null || (docker stop opencode 2>/dev/null; docker start opencode 2>/dev/null) || echo 'Container not found'
        sleep 5
        docker ps | grep opencode || echo 'Container not running'
    " 2>/dev/null
}

echo "⏳ Monitoring server health..."
for i in $(seq 1 $MAX_RETRIES); do
    echo ""
    echo "Check $i/$MAX_RETRIES..."
    
    if check_https; then
        echo "✅ Server is healthy! https://opencode.tao-shen.com/ is accessible"
        exit 0
    fi
    
    if check_server; then
        echo "  🌐 VM is online, checking container..."
        restart_container
    else
        echo "  ❌ VM is offline, waiting for auto-reboot..."
    fi
    
    echo "  ⏳ Waiting ${RETRY_INTERVAL}s before next check..."
    sleep $RETRY_INTERVAL
done

echo ""
echo "❌ Server recovery failed after $MAX_RETRIES attempts"
echo "Please check Oracle Cloud Console manually"
exit 1
