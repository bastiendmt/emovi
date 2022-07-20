import { Twemoji } from "@teuteuf/react-emoji-render";
import { Movie, pickRandomMovie, top250movies } from "./top250movies";
import { useMemo, useState } from "react";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import * as base64 from "base-64";
import * as utf8 from "utf8";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Flip, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, Route, Routes, useParams } from "react-router-dom";

interface EmoviToGuess {
  id: string;
  emojiText: string;
}

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="flex flex-col items-center">
      <img className="max-h-64" src={movie.image} alt="Movie's poster" />
      <p className="text-lg font-bold text-center">{movie.title}</p>
    </div>
  );
}

function buildShareUrl(emoviToGuess: EmoviToGuess) {
  const encodedEmovi = encodeURIComponent(
    base64.encode(utf8.encode(JSON.stringify(emoviToGuess)))
  );
  return `${window.location.origin}/guess/${encodedEmovi}`;
}

function MakeAEmovi() {
  const [movieToGuess, setMovieToGuess] = useState(pickRandomMovie());
  const [emojiText, setEmojiText] = useState("");
  const [validated, setValidated] = useState(false);

  const shareUrl = useMemo(
    () => buildShareUrl({ id: movieToGuess.id, emojiText }),
    [emojiText, movieToGuess.id]
  );

  const shareText = useMemo(() => {
    return ["#Emovi 🎬", "Guess this movie:", emojiText, shareUrl].join("\n");
  }, [emojiText, shareUrl]);

  return (
    <div>
      <div className="flex flex-col items-center gap-2">
        <MovieCard movie={movieToGuess} />
        {!validated && (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              setMovieToGuess(pickRandomMovie());
            }}
          >
            Pick another movie...
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1 items-center">
        <div className="flex flex-col gap-2 justify-center items-center grow shrink-0 basis-24">
          <p className="text-xl text-center">
            {emojiText ? (
              <Twemoji
                text={emojiText}
                options={{ className: "inline-block" }}
              />
            ) : (
              <span> Describe movie with emoji!</span>
            )}
          </p>
          {emojiText && !validated && (
            <div className="flex gap-2">
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  setEmojiText("");
                }}
              >
                Clear!
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setValidated(true)}
              >
                Validate!
              </button>
            </div>
          )}
        </div>
        {!validated ? (
          <Picker
            set="twitter"
            showSkinTones={false}
            showPreview
            onSelect={(e: any) => {
              setEmojiText((prev) => prev + e.native);
            }}
          />
        ) : (
          <div>
            <CopyToClipboard
              text={shareText}
              onCopy={() => toast("Emovi copied to clipboard")}
              options={{
                format: "text/plain",
              }}
            >
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Share my Emovi!
              </button>
            </CopyToClipboard>
          </div>
        )}
      </div>
    </div>
  );
}

function GuessAEmovi() {
  const { emovi: encodedEmovi } = useParams<{ emovi: string }>();
  const emoviToGuess: EmoviToGuess | undefined = useMemo(
    () =>
      encodedEmovi
        ? JSON.parse(
            utf8.decode(base64.decode(decodeURIComponent(encodedEmovi)))
          )
        : undefined,
    [encodedEmovi]
  );

  const movieToGuess = useMemo(() => {
    return emoviToGuess && top250movies.find((m) => m.id === emoviToGuess.id);
  }, [emoviToGuess]);

  const movieChoices = useMemo(() => {
    const otherMovies = top250movies.filter((m) => m.id !== movieToGuess?.id);
    const nineRandomPickedMovies = [...otherMovies]
      .sort(() => 0.5 - Math.random())
      .slice(0, 9);

    if (!movieToGuess) {
      return [];
    }

    return [movieToGuess, ...nineRandomPickedMovies].sort(
      () => 0.5 - Math.random()
    );
  }, [movieToGuess]);

  const [invalidGuessIds, setInvalidGuessIds] = useState<string[]>([]);
  const [movieGuessed, setMovieGuessed] = useState<boolean>(false);
  const handleTryGuess = (movieId: string) => {
    if (emoviToGuess && emoviToGuess.id === movieId) {
      setMovieGuessed(true);
      toast.success("You guessed it!");
    } else {
      setInvalidGuessIds((prev) => [...prev, movieId]);
      toast.error("Wrong movie!");
    }
  };

  const shareText = useMemo(() => {
    if (!emoviToGuess || !movieToGuess) {
      return "";
    }

    return [
      "#Emovi 🎬",
      emoviToGuess.emojiText,
      `Guessed in ${invalidGuessIds.length + 1} guesses!`,
      buildShareUrl(emoviToGuess),
    ].join("\n");
  }, [emoviToGuess, invalidGuessIds.length, movieToGuess]);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-lg font-bold text-center">Guess this movie:</p>
      {emoviToGuess && (
        <p className="text-xl text-center">
          <Twemoji
            text={emoviToGuess.emojiText}
            options={{ className: "inline-block" }}
          />
        </p>
      )}
      {!movieGuessed ? (
        <div className="flex flex-col items-center gap-1">
          {movieChoices.map((movie) => (
            <button
              key={movie.id}
              disabled={invalidGuessIds.includes(movie.id)}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded w-full"
              onClick={() => handleTryGuess(movie.id)}
            >
              {movie.title}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-center">
          {movieToGuess && <MovieCard movie={movieToGuess} />}
          <div>
            <p>Well done! You guessed the movie!</p>
            <p>In {invalidGuessIds.length + 1} guesses!</p>
          </div>
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Create your Emovie!
            </Link>
            <CopyToClipboard
              text={shareText}
              onCopy={() => toast("Result copied to clipboard")}
              options={{
                format: "text/plain",
              }}
            >
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
                Share your result!
              </button>
            </CopyToClipboard>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <div>
      <ToastContainer
        hideProgressBar
        position="top-center"
        transition={Flip}
        theme="light"
        autoClose={2000}
        bodyClassName="font-bold text-center"
        toastClassName="flex justify-center m-2 max-w-full"
        style={{ width: 500, maxWidth: "100%" }}
      />
      <div className="flex flex-col gap-2 mb-2">
        <header className="text-2xl font-extrabold text-center p-4">
          <Twemoji text="🎬 EMOVI 🎥" options={{ className: "inline-block" }} />
        </header>
        <Routes>
          <Route path="/" element={<MakeAEmovi />} />
          <Route path="/guess/:emovi" element={<GuessAEmovi />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
