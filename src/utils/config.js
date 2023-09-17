const fse = require("fs-extra");
const crypto = require("crypto");
const PuffCheeks = require("puff-cheeks");
const validator = require("validator")

/**
 * Checks for important config, and creates if needed
 * .gitignore, .env, treerat.json
 * exits process if needed for restart
 */
async function verify() {
  // Restart if config set
  let restart = false;

  // Verify .gitignore has needed ignores
  try {
    let ignoreData = fse.readFileSync(".gitignore").toString();

    if (!ignoreData.match(/# Tree Rat/)) {
      if (ignoreData.length == 0) {
        fse.appendFileSync(".gitignore", `# Tree Rat\n`);
        ignoreData += "\n"
      } else if (ignoreData.slice(-1) == "\n") {
        fse.appendFileSync(".gitignore", `\n# Tree Rat\n`);
        ignoreData += "\n"
      } else {
        fse.appendFileSync(".gitignore", `\n\n# Tree Rat\n`);
        ignoreData += "\n"
      }
    }

    if (!ignoreData.match(/\.env/)) {
      if (ignoreData.slice(-1) == "\n") {
        fse.appendFileSync(".gitignore", `.env\n`);
        ignoreData += "\n"
      } else {
        fse.appendFileSync(".gitignore", `\n.env\n`);
        ignoreData += "\n"
      }
    }

    if (!ignoreData.match(/secrets/)) {
      if (ignoreData.slice(-1) == "\n") {
        fse.appendFileSync(".gitignore", `secrets\n`);
        ignoreData += "\n"
      } else {
        fse.appendFileSync(".gitignore", `\nsecrets\n`);
        ignoreData += "\n"
      }
    }

    if (!ignoreData.match(/site/)) {
      if (ignoreData.slice(-1) == "\n") {
        fse.appendFileSync(".gitignore", `site\n`);
        ignoreData += "\n"
      } else {
        fse.appendFileSync(".gitignore", `\nsite\n`);
        ignoreData += "\n"
      }
    }
  } catch {
    fse.writeFileSync(".gitignore", `# Tree Rat\n.env\nsecrets`);
  }

  // Check .env is setup properly
  try {
    let envData = fse.readFileSync(".env").toString();

    if (
      !envData.match(/NODE_ENV\s*=\s*"development"/) &&
      !envData.match(/NODE_ENV\s*=\s*"staging"/) &&
      !envData.match(/NODE_ENV\s*=\s*"production"/)
    ) {
      restart = true;
      console.log("Missing environment setting in .env");
      const environment = getEnv();
      if (envData.length == 0 || envData.slice(-1) == "\n") {
        fse.appendFileSync(".env", `NODE_ENV="${environment}"\n`);
        envData += "\n"
      } else {
        fse.appendFileSync(".env", `\nNODE_ENV="${environment}"\n`);
        envData += "\n"
      }
      console.log("You can change this in .env");
    }

    if (!envData.match(/PORT\s*=\s*\d*/)) {
      if (envData.slice(-1) == "\n") {
        fse.appendFileSync(".env", `PORT=7533\n`);
      } else {
        fse.appendFileSync(".env", `\nPORT=7533\n`);
      }
    }
  } catch (error) {
    restart = true;
    const environment = getEnv();
    fse.writeFileSync(".env", `NODE_ENV="${environment}"\nPORT=7533`);

    console.log("You can change this in .env");
  }

  // Check secret keys are available for cookies
  if (!process.env.SECRET_KEY_1) {
    restart = true;
    fse.appendFileSync(".env", `\nSECRET_KEY_1="${crypto.randomUUID()}"`);
  }
  if (!process.env.SECRET_KEY_2) {
    restart = true;
    fse.appendFileSync(".env", `\nSECRET_KEY_2="${crypto.randomUUID()}"`);
  }

  if (restart) {
    console.log("Tree Rat needs a restart to update settings\nPlease run it again.");
    process.exit(0);
  }

  // Verify tree-rat.json exists for settings
  if (!fse.existsSync("tree-rat.json")) {
    const pretty = JSON.stringify({
      enableGzipCompression: false,
      enableAutoPrefixer: false,
      stagingUrl: "/",
      productionUrl: "/",
    }, null, 2)
    fse.writeFileSync("tree-rat.json", pretty)
  }
}

/**
 * Gets environment from used using the command line
 * @returns {string} environment
 */
function getEnv() {
  let env;
  while (env !== "d" && env !== "s" && env !== "p") {
    console.log("Please select environment:");
    console.log(`[d] Development\n[s] Staging\n[p] Production\n[q] quit`);

    env = readLine();

    if (env === "d") {
      console.log("Development environment selected.");
      return "development";
    } else if (env === "s") {
      console.log("Staging environment selected.");
      return "staging";
    } else if (env === "p") {
      console.log("Production environment selected.");
      return "production";
    } else if (env === "q") {
      console.log("Quitting setup");
      process.exit(0);
    } else {
      console.log(`Invalid entry: ${env}\n`);
    }
  }
}

/**
 * Gets a single character from stdin
 * @returns {buffer}
 */
function getChar() {
  const buffer = Buffer.alloc(1);
  // Read a single character from stdin to the temp buffer
  fse.readSync(0, buffer, 0, 1);
  return buffer[0];
}

/**
 * Gets a line of input from command line
 * @returns {string}
 */
function readLine() {
  let char;
  const buff = [];
  // Read characters one by one until encountering newline
  while ((char = getChar()) !== "\n".charCodeAt(0)) {
    buff.push(char);
  }
  // Convert the buffer to string
  return Buffer.from(buff).toString();
}

module.exports = { verify };
