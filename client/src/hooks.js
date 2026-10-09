import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

// Loads data from the API and exposes { data, loading, error, reload }
export function useApi(path) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    api(path)
      .then((data) => alive && setState({ data, loading: false, error: "" }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.message }));
    return () => {
      alive = false;
    };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | GoTravel` : "GoTravel | Travel Agency";
  }, [title]);
}
