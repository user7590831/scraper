import fs from 'node:fs';
import ora from 'ora';
import puppeteer from 'puppeteer';
import { writeFile } from 'node:fs/promises';
import { ensureDir, scrollToBottom } from '../../utils/index.js';
import { startInquirer } from '../../index.js';

const BASE_URL =
  'https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=';

const spinner = ora({
  stream: process.stdout,
});

const tiktok = async (link: string, watermark: boolean) => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  spinner.text = 'Retrieving profile information';
  spinner.start();

  await page.evaluateOnNewDocument(
    () => delete Object.getPrototypeOf(navigator).webdriver
  );
  await page.setRequestInterception(true);

  page.on('request', (request) =>
    ['font', 'image', 'ping', 'stylesheet'].includes(request.resourceType())
      ? request.abort()
      : request.continue()
  );

  await page.goto(link);

  spinner.text =
    'Scrolling to the bottom of the page. This may take a while...';
  await scrollToBottom(page, 2000);

  const identifier = (
    await page.evaluate(() => window.location.pathname)
  ).substring(2);
  const videoLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-e2e="user-post-item"] a')).map(
      (element) => (element as HTMLAnchorElement).href
    )
  );
  const path = `./downloads/TikTok/${identifier}`;

  spinner.text = `Found ${videoLinks.length} videos. Starting download of profile ${identifier}`;
  await ensureDir(path);

  const scrape = async () => {
    try {
      let downloadedFilesCounter = 0;

      for (const videoLink of videoLinks) {
        downloadedFilesCounter++;

        const fileName = videoLink.split('/').pop();

        // If the file already exists, skip it.
        if (fs.existsSync(`${path}/${fileName}.mp4`)) continue;

        spinner.text = `Downloading video ${downloadedFilesCounter}/${videoLinks.length}: ${fileName}.mp4`;

        const response = await fetch(`${BASE_URL}${fileName}`);
        const data = await response.json();

        const downloadURL = watermark
          ? data.aweme_list[0].video.download_addr.url_list[0]
          : data.aweme_list[0].video.play_addr.url_list[0];

        const videoReponse = await fetch(downloadURL);
        const videoBuffer = await videoReponse.arrayBuffer();
        await writeFile(`${path}/${fileName}.mp4`, Buffer.from(videoBuffer));
      }
    } catch (e) {
      await scrape();
    }
  };

  await scrape();

  spinner.succeed(`Finished downloading profile ${identifier}`);

  await browser.close();

  startInquirer();
};

export default tiktok;
