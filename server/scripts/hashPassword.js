/**
 * Prints a bcrypt hash for the admin password, to put in ADMIN_PASSWORD_HASH.
 *
 * Usage:
 *   node scripts/hashPassword.js
 *
 * The password is typed at a hidden prompt so it never lands in shell history.
 */
const bcrypt = require("bcryptjs");
const readline = require("readline");

const promptHidden = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) rl.output.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });

const run = async () => {
  const password = await promptHidden("Admin password: ");
  if (password.length < 10) {
    console.error("❌ Use at least 10 characters.");
    process.exit(1);
  }
  const confirm = await promptHidden("Repeat password: ");
  if (password !== confirm) {
    console.error("❌ Passwords do not match.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  console.log("\nAdd this line to server/.env:\n");
  // Single quotes stop shells from treating the $ signs in the hash as variables.
  console.log(`ADMIN_PASSWORD_HASH='${hash}'`);
  console.log("\nIn Render's environment variables, paste just the value (no quotes):\n");
  console.log(hash);
};

run();
