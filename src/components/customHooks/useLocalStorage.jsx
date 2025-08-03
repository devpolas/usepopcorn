import { useState, useEffect } from "react";
export function useLocalStorage(initialValue, key) {
  const [data, setData] = useState(function () {
    const localData = localStorage.getItem(key);
    if (!localData) return initialValue;
    return JSON.parse(localData);
  });

  // set data on local storage
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(data));
    },
    [data, key]
  );

  return [data, setData];
}
