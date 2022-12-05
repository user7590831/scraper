import inquirer from 'inquirer';
import cyberdrop from './scrapers/cyberdrop/index.js';
import famigo from './scrapers/famigo/index.js';

export const startInquirer = async () => {
  const { site } = await inquirer.prompt([
    {
      type: 'list',
      name: 'site',
      message: 'Select a site',
      choices: ['CyberDrop', 'Famigo', 'Quit'],
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
  }
};

startInquirer();
