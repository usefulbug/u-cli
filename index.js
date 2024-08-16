const inquirer = require("inquirer");
const execa = require("execa");
const fs = require("fs");
const path = require("path");
const validateProjectName = require("validate-npm-package-name");

async function create(projectName, options) {
  const cwd = options?.cwd || process.cwd();
  const inCurrent = projectName === ".";
  const name = inCurrent ? path.relative("../", cwd) : projectName;
  const targetDir = path.resolve(cwd, projectName || ".");

  const result = validateProjectName(name);
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`));
    result.errors &&
      result.errors.forEach((err) => {
        console.error(chalk.red.dim("Error: " + err));
      });
    result.warnings &&
      result.warnings.forEach((warn) => {
        console.error(chalk.red.dim("Warning: " + warn));
      });
    exit(1);
  }

  // 检查目录是否已经存在
  if (fs.existsSync(targetDir)) {
    if (inCurrent) {
      const { ok } = await inquirer.prompt([
        {
          name: "ok",
          type: "confirm",
          message: `Generate project in current directory?`,
        },
      ]);
      if (!ok) {
        return;
      }
    } else {
      const { action } = await inquirer.prompt([
        {
          name: "action",
          type: "list",
          message: `Target directory ${chalk.cyan(
            targetDir
          )} already exists. Pick an action:`,
          choices: [
            { name: "Overwrite", value: "overwrite" },
            { name: "Merge", value: "merge" },
            { name: "Cancel", value: false },
          ],
        },
      ]);
      if (!action) {
        return;
      } else if (action === "overwrite") {
        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`);
        await fs.remove(targetDir);
      }
      //   console.error(`Project directory ${name} already exists.`);
      //   process.exit(1);
    }
  }

  // 询问用户选择模板
  const { framework } = await inquirer.prompt([
    {
      type: "list",
      name: "framework",
      message: "Select a framework to create your project:",
      choices: ["vue", "react"],
    },
  ]);

  // 根据选择的框架，进一步询问选择模板类型
  const { templateType } = await inquirer.prompt([
    {
      type: "list",
      name: "templateType",
      message: `Select a ${framework} template:`,
      choices: [
        "minimalism", // 极简模板
        "official", // 官方模板
        "custom", // 定制模板
        "test", //测试模板
      ],
    },
  ]);

  const templatePath = path.join(
    __dirname,
    "templates",
    framework,
    templateType
  );

  // 拷贝模板文件到目标目录
  fs.mkdirSync(targetDir);
  copyDirectory(templatePath, targetDir);

  console.log(`Project ${name} created successfully.`);

  // 安装依赖
  await installDependencies(targetDir);
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
  console.log("Installing dependencies...");
  await execa("npm", ["install"], { cwd: projectPath, stdio: "inherit" });
  console.log("Dependencies installed successfully.");
}

module.exports = {
  create,
};
