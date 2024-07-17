console.log("js");
// a web-based music player that can fetch and play songs from a server, display the list of songs, and control playback using a play/pause button, seekbar, and forward/backward buttons.

let currentSongIndex = 0;
let audio = new Audio();
let songs = [];
let songItems = []; //used for styling the songname in the UI

async function GetSongs() {
  let a = await fetch("https://devendramane.github.io/Spotify_music_player/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let ancr = div.getElementsByTagName("a");

  for (let index = 0; index < ancr.length; index++) {
    const element = ancr[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(decodeURIComponent(element.href));
    }
  }
  return songs;
}

function loadSong(songUrl) {
  audio.src = songUrl;
  audio.load();
  highlightCurrentSong();
}

function playSong() {
  audio.play();
  document.getElementById("play").src = "Spotify_music_player/playbar_img/pause.png";
}

function pauseSong() {
  audio.pause();
  document.getElementById("play").src = "Spotify_music_player/playbar_img/play.png";
}

// function updateSeekbar() {
//   const seekbar = document.getElementById("only_seekbar");
//   const seekCircle = document.getElementById("seek_circle");
//   const progress = (audio.currentTime / audio.duration) * 100;
//   seekCircle.style.width = progress + "%"; //width : 33%
// }

function updateSeekbar() {
  const seekbar = document.getElementById("only_seekbar");
  const seekCircle = document.getElementById("seek_circle");
  const currentTimeElement = document.getElementById("current_time");
  const totalTimeElement = document.getElementById("total_time");
  const progress = (audio.currentTime / audio.duration) * 100;
  seekCircle.style.width = progress + "%"; //width : 33%

  let minutes = Math.floor(audio.currentTime / 60);
  let seconds = Math.floor(audio.currentTime % 60)
    .toString()
    .padStart(2, "0");
  currentTimeElement.textContent = `${minutes}:${seconds}`;

  minutes = Math.floor(audio.duration / 60);
  seconds = Math.floor(audio.duration % 60)
    .toString()
    .padStart(2, "0");
  totalTimeElement.textContent = `${minutes}:${seconds}`;
}
function setSeekbarPosition(event) {
  const seekbar = document.getElementById("only_seekbar");
  const seekbarRect = seekbar.getBoundingClientRect();
  const offsetX = event.clientX - seekbarRect.left;
  const newTime = (offsetX / seekbarRect.width) * audio.duration;
  audio.currentTime = newTime;
  updateSeekbar();
}

function enableSeekbarAdjustment() {
  const seekbar = document.getElementById("only_seekbar");

  seekbar.addEventListener("click", setSeekbarPosition);

  let isDragging = false;

  seekbar.addEventListener("mousedown", (event) => {
    isDragging = true;
    setSeekbarPosition(event);
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      setSeekbarPosition(event);
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  seekbar.addEventListener("touchstart", (event) => {
    isDragging = true;
    setSeekbarPosition(event.touches[0]);
  });

  document.addEventListener("touchmove", (event) => {
    if (isDragging) {
      setSeekbarPosition(event.touches[0]);
    }
  });

  document.addEventListener("touchend", () => {
    isDragging = false;
  });
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(songs[currentSongIndex]);
  playSong();
}

function previousSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(songs[currentSongIndex]);
  playSong();
}

function highlightCurrentSong() {
  songItems.forEach((item, index) => {
    if (index === currentSongIndex) {
      item.classList.add("current-song");
    } else {
      item.classList.remove("current-song");
    }
  });
}

document.getElementById("play").addEventListener("click", () => {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
});

document.querySelector(".backward").addEventListener("click", previousSong);
document.querySelector(".forward").addEventListener("click", nextSong);

audio.addEventListener("timeupdate", updateSeekbar);
audio.addEventListener("ended", nextSong); // Automatically play next song when the current one ends

async function main() {
  let songNames = await GetSongs();

  let songsUL = document
    .querySelector(".songs .songs_list")
    .getElementsByTagName("ul")[0];

  for (const song of songNames) {
    let listItem = document.createElement("li");
    listItem.style.display = "flex";
    listItem.style.justifyContent = "space-between";
    listItem.style.flexWrap = "nowrap";
    listItem.textContent = "Loading...";
    songsUL.appendChild(listItem);
    songItems.push(listItem);

    let audioElement = new Audio(song);
    audioElement.addEventListener("loadedmetadata", () => {
      let duration = audioElement.duration;
      let minutes = Math.floor(duration / 60);
      let seconds = Math.floor(duration % 60)
        .toString()
        .padStart(2, "0");
      let songName = song
        .split("/songs/")[1]
        .split(".mp3")[0]
        .replaceAll("%20", " ");
      listItem.innerHTML = `<div>${songName}</div><div>(${minutes}:${seconds})</div>`;

      listItem.addEventListener("click", () => {
        currentSongIndex = songNames.indexOf(song);
        loadSong(song);
        playSong();
      });
      let currentTime = document.getElementById("total_time");
      currentTime.innerHTML = `${minutes}:${seconds}`;
    });
  }

  for (const song of songs) {
  }
  // FCFS
  if (songNames.length > 0) {
    loadSong(songs[0]);
  }

  enableSeekbarAdjustment();
}

main();
