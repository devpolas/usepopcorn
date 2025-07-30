import { useEffect, useState } from "react";
import RatingUI from "./components/RatingUI";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// ref: https://www.omdbapi.com/
const API_KEY = "c482471a";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [err, setErr] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handelSelectedId(id) {
    setSelectedId((pre) => (id === pre ? null : id));
  }
  function onCloseMovie() {
    setSelectedId(null);
  }

  useEffect(() => {
    async function fetchData() {
      setErr("");
      setIsLoading((pre) => !pre);
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`
        );
        if (!res.ok) {
          throw new Error("Fail to fetch movies!");
        }
        const data = await res.json();

        if (data.Response === "False") {
          throw new Error("Movie Not Found!");
        }
        setMovies(data.Search);
        console.log(data.Search);
      } catch (error) {
        setErr(error.message);
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
  }, [query]);

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {/* {isLoading ? (
            <p className='loader'>Loading.....</p>
          ) : (
            <MoviesList movies={movies} />
          )} */}
          {isLoading && <p className='loader'>Loading.....</p>}
          {!isLoading && !err && (
            <MoviesList movies={movies} handelSelectedId={handelSelectedId} />
          )}
          {err && <p className='error'>{err}</p>}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails selectedId={selectedId} onCloseMovie={onCloseMovie} />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedLists watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Navbar({ children }) {
  return <nav className='nav-bar'>{children}</nav>;
}

function Logo() {
  return (
    <div className='logo'>
      <span role='img'>🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResult({ movies }) {
  return (
    <p className='num-results'>
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className='main'>{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className='box'>
      <button className='btn-toggle' onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MoviesList({ movies, handelSelectedId }) {
  return (
    <ul className='list list-movies'>
      {movies?.map((movie) => (
        <MovieList
          movie={movie}
          key={movie.imdbID}
          handelSelectedId={handelSelectedId}
        />
      ))}
    </ul>
  );
}
function MovieList({ movie, handelSelectedId }) {
  return (
    <li onClick={() => handelSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie }) {
  return (
    <div className='details'>
      <button className='btn-back' onClick={() => onCloseMovie()}>
        &larr;
      </button>
      {selectedId}
    </div>
  );
}

// function WatchBox({ children }) {
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className='box'>
//       <button
//         className='btn-toggle'
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && children}
//     </div>
//   );
// }

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className='summary'>
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedLists({ watched }) {
  return (
    <ul className='list'>
      {watched.map((movie) => (
        <WatchedList movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedList({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
