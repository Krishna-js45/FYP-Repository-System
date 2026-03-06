"use client";

import { useEffect, useState } from "react";
import { IProjectClient } from "@/types";

interface UseProjectReturn {
    project: IProjectClient | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useProject(): UseProjectReturn {
    const [project, setProject] = useState<IProjectClient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        setLoading(true);
        fetch("/api/project")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setProject(data.project);
                else setError(data.error);
            })
            .catch(() => setError("Failed to fetch project"))
            .finally(() => setLoading(false));
    }, [tick]);

    const refetch = () => setTick((t) => t + 1);

    return { project, loading, error, refetch };
}
