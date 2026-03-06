"use client";

import { useEffect, useState } from "react";
import { IUserClient } from "@/types";

interface UseAuthReturn {
    user: IUserClient | null;
    loading: boolean;
    error: string | null;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<IUserClient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setUser(data.user);
                else setError(data.error);
            })
            .catch(() => setError("Failed to fetch session"))
            .finally(() => setLoading(false));
    }, []);

    return { user, loading, error };
}
