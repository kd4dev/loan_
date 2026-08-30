const formatMessage = (level, message) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

module.exports = {
    info: (message, ...args) => {
        console.log(formatMessage('info', message), ...args);
    },
    warn: (message, ...args) => {
        console.warn(formatMessage('warn', message), ...args);
    },
    error: (message, ...args) => {
        console.error(formatMessage('error', message), ...args);
    }
};
