module.exports = {
  apps: [
    {
      name: "WarDosPem",
      script: "./server.ts",
      interpreter: "node",
      interpreter_args: "--import tsx",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
