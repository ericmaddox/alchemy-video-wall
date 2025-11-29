# Alchemy Video Wall

A web-based HLS video wall application for managing and displaying multiple live streams simultaneously in a customizable grid layout.

## Features

- **Multi-Stream Support**: Add and manage multiple HLS (m3u8) video streams
- **Customizable Grid Layout**: Choose between 1-4 column layouts
- **Global Controls**: Play, pause, mute, and unmute all streams at once
- **Persistent Storage**: Auto-save functionality with local storage support
- **Import/Export**: Save and load stream configurations as JSON
- **Responsive Design**: Adapts to different screen sizes

## Demo

The application includes demo URLs for testing:
- Big Buck Bunny: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`
- Sintel: `https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8`

## Usage

1. Open `index.html` in a modern web browser
2. Paste an m3u8 URL into the input field
3. Click "Add Stream" to add it to the video wall
4. Use the grid size selector to adjust the layout
5. Control all streams with the global playback buttons

### Controls

- **Add Stream**: Add a new HLS stream to the wall
- **Clear All**: Remove all streams from the wall
- **Export JSON**: Download current stream configuration
- **Import JSON**: Load a previously saved configuration
- **Play/Pause All**: Control playback for all streams
- **Mute/Unmute All**: Control audio for all streams
- **Wall Columns**: Adjust grid layout (1-4 columns)
- **Auto-Save**: Toggle automatic saving to local storage

## Technical Details

- Built with vanilla JavaScript
- Uses [HLS.js](https://github.com/video-dev/hls.js/) for HLS stream playback
- No build process required
- Local storage for persistence

## Browser Compatibility

Requires a modern browser with support for:
- ES6+ JavaScript
- HLS.js compatibility
- Local Storage API

## Files

- `index.html` - Main application structure
- `styles.css` - Application styling
- `app.js` - Application logic and stream management
