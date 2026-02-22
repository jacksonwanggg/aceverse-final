import { runSeed } from './seed.js';

async function main() {
  await runSeed();
  console.log('Reset complete. Database wiped and re-seeded.');
}

main().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
