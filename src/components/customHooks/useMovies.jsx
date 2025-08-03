import { useEffect, useState } from "react";

export function useMovies(query) {
  const API_KEY = "c482471a";

  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function fetchData() {
      setErr("");
      setIsLoading((pre) => !pre);
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error("Fail to fetch movies!");
        }
        const data = await res.json();

        if (data.Response === "False") {
          throw new Error("Movie Not Found!");
        }
        setMovies(data.Search);
      } catch (err) {
        if (!err === "AbortError" || !err.name === "AbortError") {
          setErr(err.message);
        }
      } finally {
        setIsLoading((pre) => !pre);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setErr("");
      return;
    }

    fetchData();

    return () => {
      controller.abort();
    };
  }, [query]);
  return { movies, isLoading, err };
}
