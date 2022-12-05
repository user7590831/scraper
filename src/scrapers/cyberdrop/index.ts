import fs from 'node:fs';
import ora from 'ora';
import puppeteer from 'puppeteer';
import { writeFile } from 'node:fs/promises';
import { ensureDir, getElementText } from '../../utils/index.js';
import { startInquirer } from '../../index.js';

const BASE_URL = 'https://cyberdrop.me/';

const spinner = ora({
  stream: process.stdout,
});

const cyberdrop = async (link: string) => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  spinner.text = 'Retrieving album information';
  spinner.start();
  await page.goto(link);

  const identifier = (
    await page.evaluate(() => window.location.pathname)
  ).substring(3);
  const title = await getElementText('#title', page);
  const totalFilesAmount = await getElementText('#totalFilesAmount', page);
  const summary = await getElementText('#count', page);
  const fileNames = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.image > img')).map((img) =>
      img.getAttribute('alt')
    )
  );
  const path = `./downloads/CyberDrop/${title} (${identifier})`;

  spinner.text = `Found ${summary}. Starting download of album ${title} (${identifier})`;
  await ensureDir(path);

  let downloadedFilesCounter = 0;

  for (const fileName of fileNames) {
    downloadedFilesCounter++;
    // If the file already exists, skip it.
    if (fs.existsSync(`${path}/${fileName}`)) continue;

    spinner.text = `Downloading file ${downloadedFilesCounter}/${totalFilesAmount}: ${fileName}`;

    let link = `${BASE_URL}${fileName}`;

    if (fileName.endsWith('.mp4')) {
      await page.goto(`${BASE_URL}${fileName}`);

      link = await page.evaluate(() => document.querySelector('source').src);
    }

    const response = await fetch(link);
    const buffer = await response.arrayBuffer();
    await writeFile(`${path}/${fileName}`, Buffer.from(buffer));
  }

  spinner.succeed(`Finished downloading album ${title} (${link})`);

  await browser.close();

  startInquirer();
};

export default cyberdrop;
