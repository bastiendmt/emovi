import { Twemoji } from "@teuteuf/react-emoji-render";
import { Movie, pickRandomMovie, top250movies } from "./top250movies";
import { useCallback, useMemo, useState } from "react";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import * as base64 from "base-64";
import * as utf8 from "utf8";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Flip, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, Route, Routes, useParams } from "react-router-dom";
import Select from "react-select";
import { DateTime, Interval } from "luxon";

function buildShareUrl(emoviToGuess: EmoviToGuess) {
  const encodedEmovi = encodeURIComponent(
    base64.encode(utf8.encode(JSON.stringify(emoviToGuess)))
  );
  return `${window.location.origin}/guess/${encodedEmovi}`;
}

export function getDayString(shiftDayCount?: number) {
  return DateTime.now()
    .plus({ days: shiftDayCount ?? 0 })
    .toFormat("yyyy-MM-dd");
}

interface EmoviToGuess {
  id: Movie["id"];
  emojiText: string;
}

const START_DATE = DateTime.fromISO("2022-07-17");

const DAILY_EMOVI: Record<string, EmoviToGuess> = {
  "2022-07-11": {
    id: "tt0101414",
    emojiText: "🌹👸🧌",
  },
  "2022-07-13": { id: "tt0167260", emojiText: "💍🌋🧙‍♂️👑" },
  "2022-07-14": { id: "tt0211915", emojiText: "👩‍🦰🎠🗼🥖🇫🇷" },
  "2022-07-15": { id: "tt1745960", emojiText: "✈️🇺🇸🕶️" },
  "2022-07-16": { id: "tt0892769", emojiText: "👨‍🏫🐉" },
  "2022-07-17": { id: "tt0114709", emojiText: "🥔🤠👨‍🚀🐊🐖🐶" },
  "2022-07-18": { id: "tt0103639", emojiText: "🧞‍♂️🪔🐒👸🤴" },
  "2022-07-19": { id: "tt0109830", emojiText: "🏃🍫🦐" },
};

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="flex flex-col items-center">
      <img className="max-h-64" src={movie.image} alt="Movie's poster" />
      <p className="text-lg font-bold text-center">{movie.title}</p>
    </div>
  );
}

function GuessAEmovi({
  emoviToGuess,
  dailyNumber,
}: {
  emoviToGuess: EmoviToGuess;
  dailyNumber?: number;
}) {
  const movieToGuess = useMemo(() => {
    return emoviToGuess && top250movies.find((m) => m.id === emoviToGuess.id);
  }, [emoviToGuess]);

  console.log("emoviToGuess", emoviToGuess);

  const selectOptions = useMemo(() => {
    return top250movies.map((m) => ({
      value: m.id,
      label: m.fullTitle,
    }));
  }, []);

  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const [invalidGuessIds, setInvalidGuessIds] = useState<string[]>([]);
  const [movieGuessed, setMovieGuessed] = useState<boolean>(false);
  const movieFailed = invalidGuessIds.length >= MAX_TRIES;
  const handleGuess = useCallback(() => {
    if (!selectedOption) {
      return;
    }

    if (emoviToGuess && emoviToGuess.id === selectedOption?.value) {
      setMovieGuessed(true);
      toast.success("You guessed it!");
    } else {
      setInvalidGuessIds((prev) => [...prev, selectedOption?.value]);
      toast.error("Wrong movie!");
      setSelectedOption(null);
    }
  }, [emoviToGuess, selectedOption]);

  const shareText = useMemo(() => {
    if (!emoviToGuess || !movieToGuess) {
      return "";
    }

    return [
      `#Emovi 🎬${dailyNumber ? ` #${dailyNumber}` : ""}`,
      emoviToGuess.emojiText,
      "🟥".repeat(invalidGuessIds.length) +
        (movieGuessed ? "🟩" : "") +
        "⬜".repeat(Math.max(MAX_TRIES - invalidGuessIds.length - 1, 0)),
      buildShareUrl(emoviToGuess),
    ].join("\n");
  }, [
    dailyNumber,
    emoviToGuess,
    invalidGuessIds.length,
    movieGuessed,
    movieToGuess,
  ]);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-lg font-bold text-center">Guess this movie:</p>
      {emoviToGuess && (
        <p className="text-xl text-center">
          <Twemoji
            text={emoviToGuess.emojiText}
            options={{ className: "inline-block" }}
          />
        </p>
      )}
      {!movieGuessed && !movieFailed ? (
        <div className="flex flex-col gap-2 items-center w-full">
          <Select
            className="w-full"
            options={selectOptions}
            onChange={setSelectedOption}
            value={selectedOption}
          />
          <button
            disabled={!selectedOption}
            onClick={handleGuess}
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded w-full"
          >
            Guess! ({invalidGuessIds.length + 1} / {MAX_TRIES})
          </button>
          {invalidGuessIds.length > 0 && (
            <div className="w-full flex justify-start items-start">
              <div className="flex-shrink-0 basis-32 font-bold whitespace-nowrap">
                Hint #1 - Year:
              </div>
              <div className="col-span-2">{movieToGuess?.year}</div>
            </div>
          )}
          {invalidGuessIds.length > 1 && (
            <div className="w-full flex justify-start items-start">
              <div className="flex-shrink-0 basis-32 font-bold whitespace-nowrap">
                Hint #2 - Crew:
              </div>
              <div className="col-span-2">{movieToGuess?.crew}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-center">
          {movieToGuess && <MovieCard movie={movieToGuess} />}
          <div>
            {movieGuessed ? (
              <>
                <p>Well done! You guessed the movie!</p>
                <p>In {invalidGuessIds.length + 1} guesses!</p>
              </>
            ) : (
              <p>You didn't found the movie...</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Link
              to="/make"
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

function DailyEmoviRoute() {
  const dayString = getDayString();
  const dailyNumber = Interval.fromDateTimes(
    START_DATE,
    DateTime.fromISO(dayString)
  ).length("day");
  const emoviToGuess = DAILY_EMOVI[dayString];
  return emoviToGuess ? (
    <GuessAEmovi emoviToGuess={emoviToGuess} dailyNumber={dailyNumber} />
  ) : (
    <div className="flex flex-col gap-2">
      <p className="text-center font-bold">No daily emovi for today!</p>
      <p className="text-center">
        <Link className="text-blue-600 font-semibold" to="/make">
          Create your own Emovi
        </Link>{" "}
        or check{" "}
        <a
          className="text-blue-600 font-semibold"
          href="https://twitter.com/search/?q=%23MyEmovi"
        >
          #MyEmovi
        </a>{" "}
        on Twitter!
      </p>
    </div>
  );
}

function MakeAEmoviRoute() {
  const [movieToGuess, setMovieToGuess] = useState(pickRandomMovie());
  const [emojiText, setEmojiText] = useState("");
  const [validated, setValidated] = useState(false);

  const shareUrl = useMemo(
    () => buildShareUrl({ id: movieToGuess.id, emojiText }),
    [emojiText, movieToGuess.id]
  );

  const shareText = useMemo(() => {
    return [
      "#Emovi 🎬 #MyEmovi",
      "Guess this movie:",
      emojiText,
      shareUrl,
    ].join("\n");
  }, [emojiText, shareUrl]);

  return (
    <div className="w-full">
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

const MAX_TRIES = 3;
function GuessAEmoviRoute() {
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

  return emoviToGuess ? (
    <GuessAEmovi emoviToGuess={emoviToGuess} />
  ) : (
    <div>Oops...</div>
  );
}

function App() {
  return (
    <div className="flex flex-auto justify-center">
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
      <div className="flex flex-col items-center justify-center gap-2 mb-2 max-w-lg w-full">
        <header className="text-2xl font-extrabold text-center p-4">
          <Twemoji text="🎬 EMOVI 🎥" options={{ className: "inline-block" }} />
        </header>
        <div className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<DailyEmoviRoute />} />
            <Route path="/make" element={<MakeAEmoviRoute />} />
            <Route path="/guess/:emovi" element={<GuessAEmoviRoute />} />
          </Routes>
        </div>
        <footer className="flex justify-center flex-col mt-8 mb-4 gap-2">
          <div className="flex justify-center items-center">
            <Twemoji
              text="❤️ EMOVI 🎥 ?"
              className="flex gap-1 items-center justify-center mr-1 font-bold"
            />{" "}
            -
            <a
              className="underline pl-1"
              href="https://www.ko-fi.com/teuteuf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="w-max">
                <Twemoji
                  text="Buy me a ☕️!"
                  options={{ className: "inline-block" }}
                />
              </div>
            </a>
          </div>
          <div className="text-center">
            <a className="text-blue-600" href="https://twitter.com/teuteuf">
              @teuteuf
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
