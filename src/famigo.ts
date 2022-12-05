import fs from 'node:fs';
import ora from 'ora';
import puppeteer from 'puppeteer';
import { writeFile } from 'node:fs/promises';
import { ensureDir, getElementText, scrollToBottom } from './utils/index.js';
import { startInquirer } from './index.js';

const spinner = ora({
  stream: process.stdout,
});

const famigo = async (link: string) => {
  const browser = await puppeteer.launch({
    headless: false,
    dumpio: false,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  page.setDefaultNavigationTimeout(0);

  spinner.text = 'Retrieving profile information';
  spinner.start();
  await page.goto(link);

  spinner.text = 'Scrolling to the bottom of the page';
  await scrollToBottom(page, 5000);

  // TODO: carousels

  const title = await getElementText(
    '.bravo-create-post .bravo-user-details > div',
    page
  );
  const fileLinks = await page.evaluate(() =>
    Array.from(document.getElementsByClassName('glightbox')).map((element) =>
      element.classList.contains('bravo-profile-image')
        ? element.getAttribute('src')
        : element.getAttribute('href')
    )
  );

  const path = `./downloads/Famigo/${title}`;

  spinner.text = `Found ${fileLinks.length} files. Starting download of profile ${title}`;
  await ensureDir(path);

  let downloadedFilesCounter = 0;

  for (const fileLink of fileLinks) {
    downloadedFilesCounter++;

    const fileName = fileLink.split('/')[fileLink.split('/').length - 1];

    // If the file already exists, skip it.
    if (fs.existsSync(`${path}/${fileName}`)) continue;

    spinner.text = `Downloading file ${downloadedFilesCounter}/${fileLinks.length}: ${fileName}`;

    // TODO: videos

    const response = await fetch(fileLink);
    const buffer = await response.arrayBuffer();
    await writeFile(`${path}/${fileName}`, Buffer.from(buffer));
  }

  spinner.succeed(`Finished downloading profile ${title}`);

  await browser.close();

  startInquirer();
};

export default famigo;
