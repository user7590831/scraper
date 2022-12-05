import inquirer from 'inquirer';
import cyberdrop from './cyberdrop.js';
import famigo from './famigo.js';

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
