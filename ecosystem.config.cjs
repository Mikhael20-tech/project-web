module.exports = {
  apps: [
    {
      name: "wardosen",
      script: "./server.ts",
      interpreter: "./node_modules/.bin/tsx",
      watch: false,
      max_memory_restart: "4G",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
