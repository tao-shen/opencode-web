'use client';

import { useState } from 'react';
import { useConfigStore } from '@/stores/useConfigStore';

export default function SettingsView() {
  const { currentModel, setCurrentModel, uiFont, setUIFont, monoFont, setMonoFont, theme, setTheme } = useConfigStore();
  const [isSaving, setIsSaving] = useState(false);

  const models = [
    { id: 'gpt-4', providerID: 'openai', modelID: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', providerID: 'openai', modelID: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'claude-3-opus', providerID: 'anthropic', modelID: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
    { id: 'claude-3-sonnet', providerID: 'anthropic', modelID: 'claude-3-sonnet-20240219', name: 'Claude 3 Sonnet' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  return (
    <div style={{ height: '100%', padding: '40px', overflowY: 'auto' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#F5F5F7' }}>
            Settings
          </h2>
          <p style={{ fontSize: '14px', color: '#86868B', marginBottom: '24px' }}>
            Configure your OpenChamber experience. Model selection, themes, and preferences.
          </p>
        </div>

        <div style={{ marginBottom: '24px', padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#F5F5F7' }}>
            Model Selection
          </h3>
          <p style={{ fontSize: '14px', color: '#86868B', marginBottom: '16px' }}>
            Select AI model to use for conversations
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setCurrentModel(model)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  border:
                    currentModel?.id === model.id
                      ? '2px solid #007AFF'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backgroundColor:
                    currentModel?.id === model.id
                      ? 'rgba(0, 122, 255, 0.1)'
                          : 'transparent',
                  color: '#F5F5F7',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                  {currentModel?.id === model.id && '✓'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{model.name}</div>
                  <div style={{ fontSize: '12px', color: '#86868B' }}>
                    {model.providerID.toUpperCase()} • {model.modelID}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px', padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#F5F5F7' }}>
            Theme
          </h3>
          <p style={{ fontSize: '14px', color: '#86868B', marginBottom: '16px' }}>
            Choose your preferred color theme
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['light', 'dark', 'auto'] as const).map((themeOption) => (
              <button
                key={themeOption}
                onClick={() => setTheme(themeOption)}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: theme === themeOption ? '2px solid #007AFF' : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  backgroundColor: theme === themeOption ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                  color: '#F5F5F7',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                    {theme === 'light' && '☀️'}
                    {theme === 'dark' && '🌙'}
                    {theme === 'auto' && '🔄'}
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#86868B' }}>
                    {themeOption === 'light' && 'Always light mode'}
                    {themeOption === 'dark' && 'Always dark mode'}
                    {themeOption === 'auto' && 'Match system theme'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            width: '100%',
            background: isSaving ? '#86868B' : '#007AFF',
            border: 'none',
            borderRadius: '8px',
            padding: '16px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: isSaving ? 0.5 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
