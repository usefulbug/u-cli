const inquirer = require('inquirer');
const execa = require('execa');
const fs = require('fs');
const path = require('path');

async function create(projectName) {
    const projectPath = path.join(process.cwd(), projectName);

    // 检查目录是否已经存在
    if (fs.existsSync(projectPath)) {
        console.error(`Project directory ${projectName} already exists.`);
        process.exit(1);
    }

    // 询问用户选择模板
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'template',
            message: 'Select a template to create your project:',
            choices: ['vue-template']
        }
    ]);

    const templatePath = path.join(__dirname, 'templates', answers.template);

    // 拷贝模板文件到目标目录
    fs.mkdirSync(projectPath);
    copyDirectory(templatePath, projectPath);

    console.log(`Project ${projectName} created successfully.`);

    // 安装依赖
    await installDependencies(projectPath);
}

function copyDirectory(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            fs.mkdirSync(destPath);
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function installDependencies(projectPath) {
    console.log('Installing dependencies...');
    await execa('npm', ['install'], { cwd: projectPath, stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
}

module.exports = {
    create
};
