#!/usr/bin/env node

const program = require('commander');
const { create } = require('../index');

program
    .version(`@vue/cli ${require('../package').version}`)
    .usage('<command> [options]')

program
    .version('1.0.0')
    .command('create <project-name>')
    .description('create a new project powered by vue-cli-service')
    .action((projectName) => {
        create(projectName);
    });


// program.commands.forEach(c => c.on('--help', () => console.log()))

program.parse(process.argv);
