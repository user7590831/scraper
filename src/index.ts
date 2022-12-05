import inquirer from 'inquirer';
import cyberdrop from './scrapers/cyberdrop/index.js';
import famigo from './scrapers/famigo/index.js';
import tiktok from './scrapers/tiktok/index.js';

export const startInquirer = async () => {
  const { site } = await inquirer.prompt([
    {
      type: 'list',
      name: 'site',
      message: 'Select a site',
      choices: ['CyberDrop', 'Famigo', 'TikTok', 'Quit'],
    },
  ]);

  switch (site) {
    case 'CyberDrop':
      cyberdrop(
        (
          await inquirer.prompt<{
            link: string;
          }>([
            {
              name: 'link',
              message: 'Paste the CyberDrop link',
            },
          ])
        ).link
      );
      break;
    case 'Famigo':
      famigo(
        (
          await inquirer.prompt<{
            link: string;
          }>([
            {
              name: 'link',
              message: 'Paste the Famigo link',
            },
          ])
        ).link
      );
      break;
    case 'TikTok':
      tiktok(
        (
          await inquirer.prompt<{
            link: string;
          }>([
            {
              name: 'link',
              message: 'Paste the TikTok link',
            },
          ])
        ).link,
        (
          await inquirer.prompt<{
            watermark: string;
          }>([
            {
              type: 'list',
              name: 'watermark',
              message: 'With watermark?',
              choices: ['No', 'Yes'],
            },
          ])
        ).watermark === 'Yes'
          ? true
          : false
      );
  }
};

startInquirer();
