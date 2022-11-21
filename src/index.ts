import inquirer from 'inquirer';
import cyberdrop from './cyberdrop.js';

export const startInquirer = async () => {
  const { site } = await inquirer.prompt([
    {
      type: 'list',
      name: 'site',
      message: 'Select a site',
      choices: ['CyberDrop', 'Quit'],
    },
  ]);

  switch (site) {
    case 'CyberDrop':
      const { link } = await inquirer.prompt([
        {
          name: 'link',
          message: 'Paste the CyberDrop link',
        },
      ]);
      cyberdrop(link);
  }
};

startInquirer();
