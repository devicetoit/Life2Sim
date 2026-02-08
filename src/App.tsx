import { useCallback, useEffect, useState } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { supabase } from './lib/supabaseClient';
import { clearLocalSettings, exportSettings, importSettings } from './lib/settingsAdapter';
import { fetchOrCreateUserSettings, saveUserSettings } from './lib/userSettingsRepository';
import { User } from '@supabase/supabase-js';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        if (!supabase) {
            setIsAuthLoading(false);
            return;
        }

        let mounted = true;

        supabase.auth.getSession().then(({ data, error }) => {
            if (!mounted) return;
            if (error) {
                setAuthError(error.message);
            } else {
                setUser(data.session?.user ?? null);
            }
            setIsAuthLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!user) return;

        let cancelled = false;
        setIsSyncing(true);
        setAuthError(null);

        fetchOrCreateUserSettings(user.id, exportSettings())
            .then((settings) => {
                if (cancelled) return;
                importSettings(settings);
            })
            .catch((error: unknown) => {
                if (cancelled) return;
                const message = error instanceof Error ? error.message : '設定の読み込みに失敗しました';
                setAuthError(message);
            })
            .finally(() => {
                if (cancelled) return;
                setIsSyncing(false);
            });

        return () => {
            cancelled = true;
        };
    }, [user]);

    const handleLogin = useCallback(async () => {
        if (!supabase) return;
        setAuthError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) {
            setAuthError(error.message);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        if (!supabase) return;
        setAuthError(null);
        const { error } = await supabase.auth.signOut();
        if (error) {
            setAuthError(error.message);
            return;
        }
        clearLocalSettings();
        setUser(null);
    }, []);

    const handleSave = useCallback(async () => {
        if (!user) {
            setAuthError('保存にはログインが必要です');
            return;
        }

        setAuthError(null);
        setIsSaving(true);
        try {
            await saveUserSettings(user.id, exportSettings());
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : '設定の保存に失敗しました';
            setAuthError(message);
        } finally {
            setIsSaving(false);
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Dashboard
                userEmail={user?.email ?? null}
                isAuthLoading={isAuthLoading}
                isSyncing={isSyncing}
                isSaving={isSaving}
                authError={authError}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onSave={handleSave}
            />
        </div>
    );
}

export default App;
