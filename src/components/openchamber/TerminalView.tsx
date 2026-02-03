'use client';

import { useEffect, useRef } from 'react';

export default function TerminalView() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);

  useEffect(() => {
    let xterm: any = null;

    const initTerminal = async () => {
      try {
        const { Terminal } = await import('@xterm/xterm');
        const { FitAddon } = await import('@xterm/addon-fit');

        xterm = new Terminal({
          cursorBlink: true,
          theme: {
            background: '#000000' as any,
            foreground: '#F5F5F7' as any,
            cursor: '#007AFF' as any,
            cursorAccent: '#007AFF' as any,
          } as any,
          fontFamily: '"SF Mono", Monaco, "Courier New", monospace',
          fontSize: 14,
        });

        const fitAddon = new FitAddon();
        xterm.loadAddon(fitAddon);

        if (terminalRef.current) {
          xterm.open(terminalRef.current);
          fitAddon.fit();
          xtermRef.current = xterm;

          xterm.writeln('\x1b[36mWelcome to OpenChamber Terminal\x1b[0m');
          xterm.writeln('\x1b[36m─────────────────────────────\x1b[0m');
          xterm.writeln('\x1b[32mConnected to OpenCode server\x1b[0m');
          xterm.writeln('\x1b[33mType your command or press Ctrl+C to exit\x1b[0m');
          xterm.writeln('');
        }
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
        if (terminalRef.current) {
          terminalRef.current.innerHTML = `<div style="color: #FF453A; padding: 20px; text-align: center;">
            Failed to load terminal. Please refresh the page.
          </div>`;
        }
      }
    };

    initTerminal();

    const handleResize = () => {
      if (xtermRef.current && terminalRef.current) {
        const fitAddon = xtermRef.current.loadAddon?.fit;
        if (fitAddon) {
          fitAddon.fit();
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        padding: '12px',
      }}
    />
  );
}
