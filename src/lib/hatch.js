import { useState, useEffect } from 'react';

const STORAGE_PREFIX = "hatch_v2_";

// Hook customizado para estado persistente
export function useStoredState(key, defaultValue) {
    const storageKey = STORAGE_PREFIX + key;

    // Obter valor inicial do localStorage ou usar padrão
    const getStoredValue = () => {
        try {
            const item = localStorage.getItem(storageKey);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Erro ao ler do localStorage:', error);
            return defaultValue;
        }
    };

    const [value, setValue] = useState(getStoredValue);

    // Atualizar localStorage quando o valor mudar
    const setStoredValue = (newValue) => {
        try {
            const valueToStore = typeof newValue === 'function' ? newValue(value) : newValue;
            localStorage.setItem(storageKey, JSON.stringify(valueToStore));
            setValue(valueToStore);
        } catch (error) {
            console.error('Erro ao escrever no localStorage:', error);
        }
    };

    // Ouvir mudanças de armazenamento de outras abas/janelas
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === storageKey && e.newValue) {
                try {
                    setValue(JSON.parse(e.newValue));
                } catch (error) {
                    console.warn('Erro ao analisar mudança de armazenamento:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [storageKey]);

    return [value, setStoredValue];
}
