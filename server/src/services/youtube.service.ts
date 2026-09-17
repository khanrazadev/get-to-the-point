import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

const YT_DLP_PATH =
  "C:\\Users\\Raza\\AppData\\Local\\Microsoft\\WinGet\\Packages\\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\\yt-dlp.exe";

export async function downloadYoutubeAudio(url: string) {
  const outputPath = path.resolve(
    "uploads",
    `youtube-${Date.now()}.m4a`,
  );

  await execFileAsync(YT_DLP_PATH, [
    "-f",
    "ba",
    "-o",
    outputPath,
    url,
  ]);

  return outputPath;
}

const audioPath = await downloadYoutubeAudio(
  "https://www.youtube.com/watch?v=cV24RCkjcs8",
);

console.log(audioPath);