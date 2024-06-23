const express = require("express");
require
const axios = require("axios");
var request = require("request");
var crypto = require("crypto");
var cors = require("cors");
var querystring = require("querystring");
require('dotenv').config();


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const USER_ID = process.env.USER_ID;

console.log("Env values",CLIENT_ID, CLIENT_SECRET, USER_ID);


const app = express();
const port = 3000;
var redirect_uri = `http://localhost:${port}/callback`; // Your redirect uri
var LocalAccessToken = "";

app.use(express.json());

const generateRandomString = (length) => {
  return crypto.randomBytes(60).toString("hex").slice(0, length);
};

app.get("/", (req, res) => {
  res.json({ message: "apis working fine" });
});

app.use(express.static(__dirname + "/public")).use(cors());

app.get("/login", function (req, res) {
  var state = generateRandomString(16);

  // your application requests authorization
  var scope =
    "user-read-private user-read-email playlist-modify-public playlist-modify-private";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: "https://api.spotify.com/v1/me",
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          console.log(body);
        });

        LocalAccessToken = access_token;

        // we can also pass the token to the browser to make requests from there
        res.redirect(
          "/#" +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
            })
        );
      } else {
        res.redirect(
          "/#" +
            querystring.stringify({
              error: "invalid_token",
            })
        );
      }
    });
  }
});

app.get("/playlist/download", async (req, res) => {
  const playlistId = req.query.playlistId;
  console.log("playlist id", playlistId);
  const debug = req.header("Debug");
  console.log("debug val", debug);

  var allTracks = [];
  var playlistNameData = null;

  const acToken = req.header("Authorization").replace("Bearer ", ""); // Extract the token from the Authorization header
  var accessToken = acToken || LocalAccessToken;
  console.log("local access token", accessToken);
  if (accessToken == "") {
    res
      .status(500)
      .json({ error: "Failed to upload playlist, try to login first" });
    return;
  }

  try {
    var nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;
    while (nextUrl != null) {
      console.log("next url", nextUrl);

      const playlistResponse = await axios.get(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("playlist name", playlistResponse.data.name);

      if (debug == "true") {
        console.log("response data", playlistResponse.data);
      }

      if (playlistResponse.data) {
        var tracks = playlistResponse.data.tracks || playlistResponse.data;

        const resp = tracks.items.map((item) => ({
          id: item.track.id,
          spotifyUrl: item.track.external_urls.spotify,
          uri: item.track.uri,
        }));

        playlistNameData = playlistResponse.data.name || playlistNameData;
        nextUrl = tracks.next;
        allTracks.push(...resp);
      } else {
        console.log("No tracks found in the response data");
        nextUrl = null;
      }
    }

    responseObject = {
      playlistName: playlistNameData,
      tracks: allTracks,
    };
    res.status(200).json(responseObject);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to download the playlist, try to login first" });
  }
});

app.post("/playlist/upload", async (req, res) => {
  try {
    const { playlistName, tracks } = req.body;
    var playlistNewName = "ankit_app_" + playlistName;

    const acToken = req.header("Authorization").replace("Bearer ", ""); // Extract the token from the Authorization header
    var accessToken = acToken || LocalAccessToken;
    console.log("local access token", accessToken);
    if (accessToken == "") {
      res
        .status(500)
        .json({ error: "Failed to upload playlist, try to login first" });
      return;
    }

    // First API call (POST request to Spotify API to create a new playlist)
    const createPlaylistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${USER_ID}/playlists`,
      {
        name: playlistNewName,
        description: "New playlist description",
        public: false,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const playlistId = createPlaylistResponse.data.id;
    console.log("playlist creation api done", playlistId);

    // Split the tracks array into chunks of 100 URIs each
    const trackChunks = [];
    for (let i = 0; i < tracks.length; i += 100) {
      trackChunks.push(tracks.slice(i, i + 100));
    }

    // Make multiple API calls to add tracks to the playlist
    for (const chunk of trackChunks) {
      const addTracksResponse = await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          uris: chunk.map((track) => track.uri),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("playlist upload api done", addTracksResponse.data);
    }
    
    res.json({ message: "Playlist uploaded successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to upload playlist, try to login first" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
