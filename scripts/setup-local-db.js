const { execSync } = require('child_process');

// Function to run shell commands
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log('Setting up the database...');

  // Run Prisma migrations
  console.log('Running Prisma migrations...');
  runCommand('npx prisma migrate dev --name init');

  // Generate Prisma client
  console.log('Generating Prisma client...');
  runCommand('npx prisma generate');

  // Seed the database
  console.log('Seeding the database...');
  runCommand('npx prisma db seed');

  console.log('Database setup complete!');
}

// Run the main function
main().catch(error => {
  console.error('Error setting up the database:');
  console.error(error);
  process.exit(1);
});
