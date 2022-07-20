import { Twemoji } from "@teuteuf/react-emoji-render";
import { pickRandomMovie } from "./top250movies";
import { useState } from "react";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import * as base64 from "base-64";
import * as utf8 from "utf8";

function App() {
  const [movieToGuess, setMovieToGuess] = useState(pickRandomMovie());
  const [emojiText, setEmojiText] = useState("");
  const [validated, setValidated] = useState(false);

  return (
    <div className="flex flex-col gap-2 mb-2">
      <header className="text-2xl font-extrabold text-center p-4">
        <Twemoji text="🎬 EMOVI 🎥" options={{ className: "inline-block" }} />
      </header>
      <div className="flex flex-col items-center gap-2">
        <img
          className="max-h-64"
          src={movieToGuess.image}
          alt="Movie's poster"
        />
        <p className="text-lg font-bold">{movieToGuess.fullTitle}</p>
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
        <p className="text-xl">
          {emojiText ? (
            <Twemoji text={emojiText} options={{ className: "inline-block" }} />
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
          utf8.decode(
            base64.decode(
              base64.encode(
                utf8.encode(JSON.stringify({ id: movieToGuess.id, emojiText }))
              )
            )
          )
        )}
      </div>
    </div>
  );
}

export default App;
