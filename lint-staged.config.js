module.exports = {
  '*.{ts,tsx,js,jsx}': ['pnpm lint', 'pnpm prettier --write'],
  '*.{json,md,css}': ['pnpm prettier --write']
};
