const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";

// Simple, reusable entity list hook with loading + refetch.
// Usage: const { data, loading, error, refetch } = useEntityList("Product", { sort: "-created_date" });
export function useEntityList(name, { sort, limit, filter } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const refetch = () => setTick((t) => t + 1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const entity = db.entities[name];
    if (!entity) {
      setError(new Error(`Unknown entity: ${name}`));
      setLoading(false);
      return;
    }
    const p = filter
      ? entity.filter(filter, sort, limit)
      : entity.list(sort, limit);
    p.then((res) => {
      if (active) {
        setData(Array.isArray(res) ? res : []);
        setError(null);
      }
    })
      .catch((e) => {
        if (active) setError(e);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, sort, limit, JSON.stringify(filter), tick]);

  return { data, loading, error, refetch };
}