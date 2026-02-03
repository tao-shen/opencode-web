import { useState, useCallback, useEffect } from 'react';

type LogoSource = 'local' | 'remote' | 'none';

interface UseProviderLogoReturn {
    src: string | null;
    onError: () => void;
    hasLogo: boolean;
}

// Static map of provider logos - populated on first use
// In production, these would be imported explicitly
const LOCAL_PROVIDER_LOGO_MAP = new Map<string, string>();

// Initialize with remote URLs only (Next.js compatible)
for (const provider of ['openai', 'anthropic', 'google', 'deepseek', 'xai', 'mistral', 'cohere', 'azure']) {
    LOCAL_PROVIDER_LOGO_MAP.set(provider, `https://models.dev/logos/${provider}.svg`);
}

export function useProviderLogo(providerId: string | null | undefined): UseProviderLogoReturn {
    const normalizedId = providerId?.toLowerCase() ?? null;
    const hasLocalLogo = normalizedId ? LOCAL_PROVIDER_LOGO_MAP.has(normalizedId) : false;
    const localLogoSrc = normalizedId ? LOCAL_PROVIDER_LOGO_MAP.get(normalizedId) ?? null : null;

    const [source, setSource] = useState<LogoSource>(hasLocalLogo ? 'local' : 'remote');

    useEffect(() => {
        setSource(hasLocalLogo ? 'local' : 'remote');
    }, [hasLocalLogo, normalizedId]);

    const handleError = useCallback(() => {
        setSource((current) => (current === 'local' && hasLocalLogo ? 'remote' : 'none'));
    }, [hasLocalLogo]);

    if (!normalizedId) {
        return { src: null, onError: handleError, hasLogo: false };
    }

    if (source === 'local' && localLogoSrc) {
        return {
            src: localLogoSrc,
            onError: handleError,
            hasLogo: true,
        };
    }

    if (source === 'remote') {
        return {
            src: `https://models.dev/logos/${normalizedId}.svg`,
            onError: handleError,
            hasLogo: true,
        };
    }

    return { src: null, onError: handleError, hasLogo: false };
}
