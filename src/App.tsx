import { Twemoji } from "@teuteuf/react-emoji-render";
import { pickRandomMovie } from "./top250movies";
import { useMemo, useState } from "react";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import * as base64 from "base-64";
import * as utf8 from "utf8";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Flip, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Routes, useParams, useSearchParams } from "react-router-dom";

function MakeAEmovi() {
  const [movieToGuess, setMovieToGuess] = useState(pickRandomMovie());
  const [emojiText, setEmojiText] = useState("");
  const [validated, setValidated] = useState(false);

  const shareUrl = useMemo(() => {
    const encodedEmovi = base64.encode(
      utf8.encode(JSON.stringify({ id: movieToGuess.id, emojiText }))
    );
    return `${window.location.origin}/emovi/${encodedEmovi}`;
  }, [emojiText, movieToGuess.id]);

  return (
    <div>
      <div className="flex flex-col items-center gap-2">
        <img
          className="max-h-64"
          src={movieToGuess.image}
          alt="Movie's poster"
        />
        <p className="text-lg font-bold text-center">
          {movieToGuess.fullTitle}
        </p>
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
          <p className="text-xl">
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
              text={shareUrl}
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
  console.log(JSON.parse(utf8.decode(base64.decode(encodedEmovi!))));
  const emoviToGuess: { id: string; emojiText: string } | undefined =
    encodedEmovi
      ? JSON.parse(utf8.decode(base64.decode(encodedEmovi)))
      : undefined;

  return (
    <div>
      <p>GUESS!</p>
      {emoviToGuess && <p>{emoviToGuess.emojiText}</p>}
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
          <Route path="/emovi/:emovi" element={<GuessAEmovi />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
