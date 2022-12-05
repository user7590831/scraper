import fs from 'node:fs';
import ora from 'ora';
import puppeteer from 'puppeteer';
import { writeFile } from 'node:fs/promises';
import {
  ensureDir,
  getElementText,
  scrollToBottom,
} from './../../utils/index.js';
import { startInquirer } from './../../index.js';

const spinner = ora({
  stream: process.stdout,
});

//! Note: video scraping does not work
const famigo = async (link: string) => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  spinner.text = 'Retrieving profile information';
  spinner.start();
  await page.goto(link, {
    timeout: 0,
  });

  spinner.text =
    'Scrolling to the bottom of the page. This may take a while...';
  await scrollToBottom(page, 5000);

  const title = await getElementText(
    '.bravo-create-post .bravo-user-details > div',
    page
  );
  const imageLinks = await page.evaluate(() =>
    Array.from(document.getElementsByClassName('glightbox')).map((element) =>
      element.classList.contains('bravo-profile-image')
        ? (element as HTMLImageElement).src
        : (element as HTMLAnchorElement).href
    )
  );
  const path = `./downloads/Famigo/${title}`;

  spinner.text = `Found ${imageLinks.length} images. Starting download of profile ${title}`;
  await ensureDir(path);

  let downloadedFilesCounter = 0;

  for (const imageLink of imageLinks) {
    downloadedFilesCounter++;

    const fileName = imageLink.split('/').pop();

    // If the file already exists, skip it.
    if (fs.existsSync(`${path}/${fileName}`)) continue;

    spinner.text = `Downloading image ${downloadedFilesCounter}/${imageLinks.length}: ${fileName}`;

    const response = await fetch(imageLink);
    const buffer = await response.arrayBuffer();
    await writeFile(`${path}/${fileName}`, Buffer.from(buffer));
  }

  spinner.succeed(`Finished downloading profile ${title}`);

  await browser.close();

  startInquirer();
};

export default famigo;
