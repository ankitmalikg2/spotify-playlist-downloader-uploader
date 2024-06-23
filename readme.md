# Spotify Playlist Downloader and Uploader

This project is a Node.js application that allows you to download and upload Spotify playlists. It surpasses the 100 tracks limit set by the Spotify API for a single API call.

## Requirements

- Node.js 
- NPM 

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/spotify-playlist-downloader.git
```

### 2. Install the dependencies

```
cd spotify-playlist-downloader
npm install
```

### 3. Create a Spotify app and obtain the necessary credentials

Create your app on the Spotify Developer Dashboard: https://developer.spotify.com/documentation/web-api/concepts/apps

Register your redirect URL as http://localhost:3000/callback
(this is required because if this is not registered then you might get error related to invalid callback url).


### 4. Set up environment variables
Copy `.env.example` into `.env` file
Change the required values in `.env` file
You will get these values from spotify app and spotify profile page

```
CLIENT_ID=your_spotify_client_id
CLIENT_SECRET=your_spotify_client_secret
USER_ID=your_spotify_user_id

```

### 5. Start the application

```
npm start
```

## Usage

- Access the application in your browser at http://localhost:3000
- Log in with your Spotify account
- Use the following API endpoints:

### GET /playlist/download: Downloads a Spotify playlist. Example:

```
curl --location 'http://localhost:3000/playlist/download?playlistId=693upujRZBq6WNH30wwFvT' \
--header 'Authorization: Bearer BQCxjI6yNABGPn4RaGqxnNXb2Gj3swvU-Xy5yzEpDAlhp6Gag7-c9E-CFptOXPrCKMJkpScHpCVo1Q_UMONIrr0T3SLMkydQOdhmAU2U1LlDWf4ZmM3gO4w2ejQ9m4XAY1AEsOyjW4y391GpsFGfXT2oaFdgo70zH3Npeb5Q7-8sE8E301YMR5P-EAaji1JsJbzcIEr3RNIfPNnOolplHv0P8qQtV-JeCnUu13HqEVnJoh_WfV4yiT26IL2G1iYYP0w5mwlAgJyszRU7&refresh_token=AQB_G61gpXxZW5b6BTu9p4IVMsCqlozLw0Kpb_Wmv1GVznkmn2dG-1oL8CQTUbi0AbB4asVA1jIBkMPJk6CJ_IXzqFKuXDzcyQnIrlHcYF9ytawZWqlY6HKj14zpaEH7vMk' \
--header 'Debug: true'
```


### POST /playlist/upload: Uploads a Spotify playlist. Example:


```
curl --location 'http://localhost:3000/playlist/upload' \
--header 'Authorization: Bearer BQCxjI6yNABGPn4RaGqxnNXb2Gj3swvU-Xy5yzEpDAlhp6Gag7-c9E-CFptOXPrCKMJkpScHpCVo1Q_UMONIrr0T3SLMkydQOdhmAU2U1LlDWf4ZmM3gO4w2ejQ9m4XAY1AEsOyjW4y391GpsFGfXT2oaFdgo70zH3Npeb5Q7-8sE8E301YMR5P-EAaji1JsJbzcIEr3RNIfPNnOolplHv0P8qQtV-JeCnUu13HqEVnJoh_WfV4yiT26IL2G1iYYP0w5mwlAgJyszRU7&refresh_token=AQB_G61gpXxZW5b6BTu9p4IVMsCqlozLw0Kpb_Wmv1GVznkmn2dG-1oL8CQTUbi0AbB4asVA1jIBkMPJk6CJ_IXzqFKuXDzcyQnIrlHcYF9ytawZWqlY6HKj14zpaEH7vMk' \
--header 'Content-Type: application/json' \
--data '{
    "playlistName": "Bollywood 2000s 2010s  dance hits",
    "tracks": [
        {
            "id": "3Qpk2qHree1RTH5lZaKnEK",
            "spotifyUrl": "https://open.spotify.com/track/3Qpk2qHree1RTH5lZaKnEK",
            "uri": "spotify:track:3Qpk2qHree1RTH5lZaKnEK"
        },
        {
            "id": "6WediUhXDfm8FR3wlM0r3G",
            "spotifyUrl": "https://open.spotify.com/track/6WediUhXDfm8FR3wlM0r3G",
            "uri": "spotify:track:6WediUhXDfm8FR3wlM0r3G"
        }
    ]
}'
```