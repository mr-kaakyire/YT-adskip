// server.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import express, { json } from "express";
import cors from "cors";
import { YoutubeTranscript } from "youtube-transcript";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());
app.use(cors());
const generationConfig = {
  temperature: 1,
  responseSchema: {
    type: "object",
    properties: {
      timestamps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            startTime: {
              type: "number",
            },
            endTime: {
              type: "number",
            },
          },
        },
      },
    },
  },
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `Return the part of the transcript that is about advertisement.
    Do not add "json" in you response.
    Format your response as JSON, containing only the following keys: \n
    - timestamps (array of objects):
        - startTime (number): Start time of the advertisement in seconds.
        - endTime (number): End time of the advertisement in seconds.

    Not all transcripts will contain advertisements, if it doesn't return an empty array.
    If there are multiple advertisements, return a JSON containing an array of the various start and end times.`,
});




app.post("/timestamp", async (req, res) => {
  const videoId = req.body.videoId;
  console.log(videoId);

  const fetchTranscript = async () => {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const response = await model.generateText({
        generationConfig: generationConfig,
        text: transcript, 
      });
      res.json(response)
    } catch (error) {
      console.error("Error fetching transcript:", error);
    }
  };

  // console.log(result.response.text());
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
