import { mkdir } from 'node:fs/promises';
import { Page } from 'puppeteer';

export const ensureDir = async (path: string) =>
  await mkdir(path, { recursive: true });

export const getElementText = async (selector: string, page: Page) =>
  await page.$$eval(selector, (nodes) => nodes[0].textContent?.trim());
