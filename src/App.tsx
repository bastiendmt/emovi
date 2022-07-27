import { Twemoji } from "@teuteuf/react-emoji-render";
import { Movie, pickRandomMovie, allMovies } from "./movies";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import * as base64 from "base-64";
import * as utf8 from "utf8";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Flip, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import Select from "react-select";
import { DateTime, Interval } from "luxon";

const GUESSES_KEY = "guesses";

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
  author?: string;
}

const START_DATE = DateTime.fromISO("2022-07-17");

const DAILY_EMOVI: Record<string, EmoviToGuess> = {
  "2022-07-17": {
    id: "tt0114709",
    emojiText: "🥔🤠👨‍🚀🐊🐖🐶",
    author: "teuteuf",
  },
  "2022-07-18": { id: "tt0167260", emojiText: "💍🌋🧙‍♂️👑" },
  "2022-07-19": { id: "tt0103639", emojiText: "🧞‍♂️🪔🐒👸🤴" },
  "2022-07-20": { id: "tt0211915", emojiText: "👩‍🦰🎠🗼🥖🇫🇷" },
  "2022-07-21": { id: "tt1745960", emojiText: "✈️🇺🇸🕶️" },
  "2022-07-22": { id: "tt0109830", emojiText: "🏃🍫🦐" },
  "2022-07-23": { id: "tt0120382", emojiText: "🙍‍♂️🎥⛵😨📺" },
  "2022-07-24": {
    id: "tt4633694",
    emojiText: "🕷️🦸🦹🦸‍♂️🦹‍♂️🦸‍♀️🦹‍♀️🎨✏️",
  },
  "2022-07-25": { id: "tt0090605", emojiText: "👽🤰🩸😱" },
  "2022-07-26": { id: "tt0062622", emojiText: "👁️🖥️🛰️🚀" },
  "2022-07-27": { id: "tt0054215", emojiText: "🔪🚿🧓" },
  "2022-07-28": { id: "tt0101414", emojiText: "🌹👸🧌" },
  "2022-07-29": { id: "tt0264464", emojiText: "🏃‍♂️✈️💰🏃" },
  "2022-07-30": { id: "tt0045152", emojiText: "☔🎤😃" },
  "2022-07-31": { id: "tt0107290", emojiText: "🦟💉🥚🦕🦖🚨🏃‍♂️" },
  "2022-08-01": { id: "tt0993846", emojiText: "🐺🧱🛣️〽️🏦💵" },
  "2022-08-02": { id: "tt0382932", emojiText: "🐭💆‍♂️👨‍🍳🍲" },
  "2022-08-03": { id: "tt10648342", emojiText: "🦸🔨❤️➕⛈️" },
  "2022-08-04": { id: "tt0482571", emojiText: "🏃🚪🎩🚪🏃▶️👬" },
  "2022-08-05": { id: "tt2380307", emojiText: "🎸💀👦🇲🇽" },
  "2022-08-06": { id: "tt0107048", emojiText: "🔄⏰🦔" },
  "2022-08-07": { id: "tt0133093", emojiText: "🕵️🕵️‍♀️🤜🤵🔌💊" },
  "2022-08-08": { id: "tt1130884", emojiText: "👮‍♂️💊🏝️😨" },
  "2022-08-09": { id: "tt2293640", emojiText: "🤓🤓🤓🍌🧒" },
  "2022-08-10": { id: "tt0114369", emojiText: "😋😛😴🤢😡😎🤤👀" },
  "2022-08-11": { id: "tt5311514", emojiText: "👦💬⁉️↔️⁉️🗨️👧🗾🌊☄️" },
  "2022-08-12": { id: "tt0119217", emojiText: "🧹🏫👨‍🏫🧠🍎" },
  "2022-08-13": { id: "tt12412888", emojiText: "🦔👟✌️" },
  "2022-08-14": { id: "tt0088763", emojiText: "🚗🔙⌚👨‍🔬🙍" },
  "2022-08-15": { id: "tt0435761", emojiText: "👨‍🚀🤠🏫🍓🧸" },
  "2022-08-16": { id: "tt0116629", emojiText: "🇺🇸🎆👽👊" },
  "2022-08-17": { id: "tt0325980", emojiText: "🏴‍☠️🌊💀⚔️⚫📿" },
  "2022-08-18": { id: "tt6467266", emojiText: "🐷🦍🦁🎹🎧🦔" },
  "2022-08-19": { id: "tt1160419", emojiText: "👩‍👦🗡️⏳🐛🪐" },
  "2022-08-20": { id: "tt0066921", emojiText: "👁️🎩🦯🥛🍊" },
  "2022-08-21": { id: "tt1049413", emojiText: "👴🧒🎈🏠🏞️🐕🔼" },
  "2022-08-22": { id: "tt2582802", emojiText: "🥁👨‍🦲⏱️🩸🚗📁🎶" },
  "2022-08-23": { id: "tt0120338", emojiText: "💑🚢🧊🥶👵" },
  "2022-08-24": { id: "tt2096673", emojiText: "😡😭😊🤢😱🧠" },
  "2022-08-25": { id: "tt0050083", emojiText: "😠😠😠😠😠😠😠😠😠😠😠😠" },
  "2022-08-26": { id: "tt1396484", emojiText: "🤡👿🎈" },
  "2022-08-27": { id: "tt0073195", emojiText: "🦈😱" },
  "2022-08-28": { id: "tt0137523", emojiText: "🥊♣️🧼" },
  "2022-08-29": { id: "tt1877830", emojiText: "🦇🐱🐧❓" },
  "2022-08-30": { id: "tt0088247", emojiText: "🤖🕶️🔫" },
  "2022-08-31": { id: "tt0110413", emojiText: "🧔🔫🥛👧" },
};

try {
  Object.keys(DAILY_EMOVI).reduce<string[]>((acc, curr) => {
    if (acc.includes(DAILY_EMOVI[curr].id)) {
      throw new Error(
        `Duplicate movie id in DAILY_EMOVI: ${DAILY_EMOVI[curr].id}`
      );
    }
    return acc.concat(DAILY_EMOVI[curr].id);
  }, []);
} catch (error) {
  console.error(error);
}

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="flex flex-col items-center">
      <img className="h-64" src={movie.image} alt="Movie's poster" />
      <p className="text-lg font-bold text-center">{movie.title}</p>
    </div>
  );
}

function getSavedGuesses() {
  const guesses: Record<
    string,
    { movieGuessed: boolean; invalidGuessIds: string[] } | undefined
  > = JSON.parse(localStorage.getItem(GUESSES_KEY) ?? "{}");

  return guesses;
}

function getStats() {
  const allGuesses = getSavedGuesses();

  const streakBonus: Record<string, number> = {
    "2022-07-17": 0,
    "2022-07-18": 1,
    "2022-07-19": 2,
    "2022-07-20": 3,
    "2022-07-21": 4,
  };

  const days = Object.keys(allGuesses);
  let currentStreak = days.length > 0 ? streakBonus[days[0]] ?? 0 : 0;
  let maxStreak = 0;
  let previousDate: DateTime | undefined;
  for (const [dayString, guesses] of Object.entries(allGuesses)) {
    const currentDate = DateTime.fromFormat(dayString, "yyyy-MM-dd");
    if (guesses!.movieGuessed) {
      if (
        previousDate == null ||
        previousDate.plus({ days: 1 }).hasSame(currentDate, "day")
      ) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 0;
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }
    previousDate = currentDate;
  }

  return {
    currentStreak,
    maxStreak,
  };
}

function GuessAEmovi({
  emoviToGuess,
  dailyNumber,
  dayString,
}: {
  emoviToGuess: EmoviToGuess;
  dailyNumber?: number;
  dayString?: string;
}) {
  const movieToGuess = useMemo(() => {
    return emoviToGuess && allMovies.find((m) => m.id === emoviToGuess.id);
  }, [emoviToGuess]);

  useEffect(() => {
    console.log(emoviToGuess);
  }, [emoviToGuess]);

  const selectOptions = useMemo(() => {
    return allMovies.map((m) => ({
      value: m.id,
      label: m.title,
    }));
  }, []);

  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const initialSavedGuess = useMemo(() => {
    if (!dayString) {
      return undefined;
    }

    const savedGuesses = getSavedGuesses();
    return savedGuesses[dayString];
  }, [dayString]);
  const [invalidGuessIds, setInvalidGuessIds] = useState<string[]>(
    initialSavedGuess?.invalidGuessIds ?? []
  );
  const [movieGuessed, setMovieGuessed] = useState<boolean>(
    initialSavedGuess?.movieGuessed ?? false
  );
  const movieFailed = invalidGuessIds.length >= MAX_TRIES;
  const handleGetHint = useCallback(() => {
    setInvalidGuessIds((prev) => [...prev, ""]);
  }, []);
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

  const [stats, setStats] = useState(getStats());

  useEffect(() => {
    if (!dayString) {
      return;
    }

    const guesses = getSavedGuesses();

    if (!guesses[dayString]) {
      guesses[dayString] = {
        movieGuessed: false,
        invalidGuessIds: [],
      };
    }

    guesses[dayString]!.movieGuessed = movieGuessed;
    guesses[dayString]!.invalidGuessIds = invalidGuessIds;

    localStorage.setItem(GUESSES_KEY, JSON.stringify(guesses));
    setStats(getStats());
  }, [dayString, invalidGuessIds, movieGuessed]);

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
      dayString ? window.location.origin : buildShareUrl(emoviToGuess),
    ].join("\n");
  }, [
    dailyNumber,
    dayString,
    emoviToGuess,
    invalidGuessIds.length,
    movieGuessed,
    movieToGuess,
  ]);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex flex-col items-center w-full">
        <p className="text-lg font-bold text-center">Guess this movie:</p>
        {emoviToGuess && (
          <p className="text-3xl text-center">
            <Twemoji
              text={emoviToGuess.emojiText}
              options={{ className: "inline-block" }}
            />
          </p>
        )}
        {emoviToGuess.author && (
          <p className="text-center">
            by{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 font-semibold"
              href={`https://twitter.com/${emoviToGuess.author}`}
            >
              {emoviToGuess.author}
            </a>
          </p>
        )}
      </div>
      {!movieGuessed && !movieFailed ? (
        <div className="flex flex-col gap-4 items-center w-full">
          <Select
            className="w-full"
            options={selectOptions}
            onChange={setSelectedOption}
            value={selectedOption}
          />
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleGuess}
              disabled={!selectedOption}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 px-4 rounded basis-1/2"
            >
              Guess! ({invalidGuessIds.length + 1} / {MAX_TRIES})
            </button>
            <button
              onClick={handleGetHint}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded basis-1/2"
            >
              {invalidGuessIds.length >= MAX_TRIES - 1
                ? "Give up..."
                : "Get a hint..."}
            </button>
          </div>
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
          <div className="mt-16 flex flex-col gap-2 items-center">
            {!dailyNumber && (
              <>
                <Link
                  to="/"
                  className="text-blue-500 hover:text-blue-700 font-bold"
                >
                  Go to the daily Emovi
                </Link>
                <p>or</p>
              </>
            )}
            <Link
              to="/make"
              className="text-blue-500 hover:text-blue-700 font-bold"
            >
              Create your own Emovi
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-center w-full">
          {movieToGuess && <MovieCard movie={movieToGuess} />}
          <div>
            {movieGuessed ? (
              <>
                <p>Well done! You guessed the movie!</p>
                <p>In {invalidGuessIds.length + 1} guesses!</p>
              </>
            ) : (
              <p>You failed to guess the movie...</p>
            )}
          </div>
          <div className="flex flex-col gap-1 w-full">
            <CopyToClipboard
              text={shareText}
              onCopy={() => toast("Result copied to clipboard")}
              options={{
                format: "text/plain",
              }}
            >
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
                Share your result
              </button>
            </CopyToClipboard>
            <Link
              to="/make"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Create your Emovi
            </Link>
            {!dailyNumber && (
              <Link
                to="/"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
              >
                Go to the daily Emovi
              </Link>
            )}
          </div>
          <div className="py-4 font-bold">
            Current streak: {stats.currentStreak} - Max streak:{" "}
            {stats.maxStreak}
          </div>
        </div>
      )}
    </div>
  );
}

function DailyEmoviRoute() {
  const dayString = getDayString();
  const dailyNumber =
    Interval.fromDateTimes(START_DATE, DateTime.fromISO(dayString)).length(
      "day"
    ) + 1;
  const emoviToGuess = DAILY_EMOVI[dayString];
  return emoviToGuess ? (
    <div className="flex flex-col gap-2">
      <p className="text-center font-bold text-lg">Emovi #{dailyNumber}</p>
      <GuessAEmovi
        emoviToGuess={emoviToGuess}
        dailyNumber={dailyNumber}
        dayString={dayString}
      />
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <p className="text-center font-bold">No daily emovi for today!</p>
      <p className="text-center">
        <Link
          className="text-blue-500 hover:text-blue-700 font-bold"
          to="/make"
        >
          Create your own Emovi
        </Link>{" "}
        or check{" "}
        <a
          className="text-blue-500 hover:text-blue-700 font-bold"
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

  const handleNewEmovi = useCallback(() => {
    setMovieToGuess(pickRandomMovie());
    setEmojiText("");
    setValidated(false);
  }, []);

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
      <div className="flex flex-col items-center gap-2 w-full">
        <MovieCard movie={movieToGuess} />
        {!validated && (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            onClick={() => {
              setMovieToGuess(pickRandomMovie());
            }}
          >
            Pick another movie...
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1 items-center">
        <div className="flex flex-col gap-2 justify-center items-center grow shrink-0 basis-32">
          <p className="text-xl text-center">
            {emojiText ? (
              <Twemoji
                text={emojiText}
                options={{ className: "inline-block text-3xl" }}
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
                Clear
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setValidated(true)}
              >
                Validate
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
          <div className="flex flex-col gap-1 w-full text-center">
            <CopyToClipboard
              text={shareText}
              onCopy={() => toast("Emovi copied to clipboard")}
              options={{
                format: "text/plain",
              }}
            >
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Share my Emovi
              </button>
            </CopyToClipboard>
            <button
              onClick={handleNewEmovi}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create another Emovi
            </button>
            <Link
              to="/"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to the daily Emovi
            </Link>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 font-bold text-center py-4"
              href="https://docs.google.com/forms/d/e/1FAIpQLSevIwncXHGD4K4yPBHi3Z2P0ynzmqaWZccfCCnzitN5xei54g/viewform?usp=sf_link&hl=en"
            >
              Suggest a daily Emovi
            </a>
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
  const dayString = getDayString();
  const dailyEmovi = DAILY_EMOVI[dayString];

  if (
    dailyEmovi &&
    emoviToGuess &&
    dailyEmovi.id === emoviToGuess.id &&
    dailyEmovi.emojiText === emoviToGuess.emojiText
  ) {
    return <Navigate to="/" />;
  }

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
        <header className="text-4xl font-bold text-center w-full border-b-2 border-gray-200">
          <div className="w-full my-1">
            <Link to="/">
              <Twemoji
                text="🎬 EMOVI 🎥"
                options={{ className: "inline-block" }}
              />
            </Link>
          </div>
        </header>
        <div className="flex-grow w-full p-1">
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
            <a
              className="text-blue-500 hover:text-blue-700"
              href="https://twitter.com/teuteuf"
            >
              @teuteuf
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
