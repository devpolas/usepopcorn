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
  const [err, setErr] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  // const [watched, setWatched] = useState([]);

  //useState Hook only receive a callback function don't receive any arguments
  const [watched, setWatched] = useState(() => {
    return JSON.parse(localStorage.getItem("watched"));
  });

  function handelSelectedId(id) {
    setSelectedId((pre) => (id === pre ? null : id));
  }
  function onCloseMovie() {
    setSelectedId(null);
  }

  function handelWatched(movie) {
    setWatched((pre) => [...pre, movie]);
  }

  function handelDelete(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

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

    onCloseMovie();
    fetchData();

    return () => {
      controller.abort();
    };
  }, [query]);

  // set data on local storage
  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

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
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={onCloseMovie}
              handelWatched={handelWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedLists watched={watched} handelDelete={handelDelete} />
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

function MovieDetails({ selectedId, onCloseMovie, handelWatched, watched }) {
  const [selectedMovie, setSelectedMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [myRating, setMyRating] = useState(0);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const userRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Actors: actors,
    Plot: plot,
    Released: released,
    Director: director,
    Genre: genre,
  } = selectedMovie;

  function handelMovie() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      runtime: Number(runtime.split(" ").at(0)),
      year,
      poster,
      imdbRating: Number(imdbRating),
      userRating: Number(myRating),
    };
    handelWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const req = await fetch(
        `http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedId}`
      );
      if (!req.ok) {
        throw new Error("Fail to fetch");
      }
      const data = await req.json();

      setSelectedMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;

    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);

  useEffect(() => {
    function callback(e) {
      if (e.code === "Escape") {
        onCloseMovie();
        console.log("Closed");
      }
    }
    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [onCloseMovie]);

  return (
    <div className='details'>
      {isLoading ? (
        <p className='loader'>Loading.....</p>
      ) : (
        <>
          <header>
            <button className='btn-back' onClick={() => onCloseMovie()}>
              &larr;
            </button>
            <img src={poster} alt={`${title} poster`} />
            <div className='details-overview'>
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                ⭐<span>{imdbRating}</span>
              </p>
            </div>
          </header>
          <section>
            <div className='rating'>
              {!isWatched ? (
                <>
                  <RatingUI
                    maxRating={10}
                    size={24}
                    onSetRating={setMyRating}
                  />
                  {myRating > 0 && (
                    <button className='btn-add' onClick={() => handelMovie()}>
                      Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>{`You Already Rated This Movie With: ⭐ ${userRating}`}</p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors} </p>
            <p>Directed By {director} </p>
          </section>
        </>
      )}
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
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)}min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedLists({ watched, handelDelete }) {
  return (
    <ul className='list'>
      {watched.map((movie) => (
        <WatchedList
          movie={movie}
          key={movie.imdbID}
          handelDelete={handelDelete}
        />
      ))}
    </ul>
  );
}

function WatchedList({ movie, handelDelete }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
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
      <button className='btn-delete' onClick={() => handelDelete(movie.imdbID)}>
        x
      </button>
    </li>
  );
}
