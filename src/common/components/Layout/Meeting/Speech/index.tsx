// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import { useWhisper } from "./useWhisper";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);

  const {
    recording,
    speaking,
    transcribing,
    transcript,
    startRecording,
    stopRecording,
  } = useWhisper({
    apiKey: "sk-xxx",
    streaming: true,
    timeSlice: 5000,
    whisperConfig: {
      language: 'zh',
      prompt: '以下是普通话的句子。'
    },
  });

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecording((prevRecording) => !prevRecording);
    inputRef.current.classList.toggle("recording");

    const userInputElement = inputRef.current;
    if (userInputElement) {
      userInputElement.style.borderColor = isRecording ? "" : "red";
    }
  };

  return (
    <main>
      <h1>Chat to Reflect!</h1>
      <div className="bottom-elements">
        <p
          className={`user-input ${isRecording ? "recording" : ""} ${
            !transcript.text ? "placeholder" : ""
          }`}
          ref={inputRef}
          data-placeholder="Transcript will show here">
          {transcript.text ? transcript.text : ""}
        </p>
        <button
          className="record-buttons"
          type="button"
          onClick={toggleRecording}>
          {isRecording ? "STOP" : "RECORD"}
        </button>
      </div>
    </main>
  );
}

export default App;