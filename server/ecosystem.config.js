module.exports = {
    apps: [
        {
            name: "lms-api",
            script: "src/index.js",
            instances: "max",
            exec_mode: "cluster",
            watch: false,
            max_memory_restart: "500M",
            node_args: "--experimental-vm-modules",
            env: {
                NODE_ENV: "development",
                PORT: 8000,
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 8000,
            },
            // Logging
            log_file: "logs/combined.log",
            out_file: "logs/out.log",
            error_file: "logs/error.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss",
            merge_logs: true,
            // Graceful restart
            kill_timeout: 10000,
            wait_ready: true,
            listen_timeout: 10000,
        },
    ],
};
