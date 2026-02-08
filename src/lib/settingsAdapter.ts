import { ProjectData } from '../types';
import { useStore, STORAGE_KEY } from '../store';

// Supabase連携側はこの2関数だけを使う。状態管理を変更してもここだけ差し替えればよい。
export function exportSettings(): any {
    const current = useStore.getState().data;
    return JSON.parse(JSON.stringify(current)) as ProjectData;
}

export function importSettings(data: any): void {
    useStore.getState().setData(data as ProjectData);
}

export function clearLocalSettings(): void {
    useStore.getState().reset();
    localStorage.removeItem(STORAGE_KEY);
}
