import { useEffect, useState } from "react";

const STORAGE_KEY = "party-tracker-dm-key";

export function useDmKey() {
  const [dmKey, setDmKeyState] = useState("");

  useEffect(() => {
    try {
      setDmKeyState(localStorage.getItem(STORAGE_KEY) ?? "");
    } catch {}
  }, []);

  const setDmKey = (value: string) => {
    setDmKeyState(value);
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, value);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  };

  return {
    dmKey,
    hasDmKey: dmKey.trim().length > 0,
    setDmKey,
  };
}

