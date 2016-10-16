export default function(config) {
    var cfg = {};

    // Update prefix
    var prefix = config.prefix ? config.prefix : '/';

    if (prefix.slice(0, 1) !== '/') {
        prefix = '/' + prefix;
    };
    if (prefix.split('').pop() !== '/') {
        prefix = prefix + '/';
    };

    // Copy properties + defaults
    if (config) {
        cfg.mark = config.mark;
        cfg.port = config.port;
        cfg.appname = config.appname || false;
        cfg.host = config.host;
        cfg.prefix = prefix;
        cfg.origin = config.origin;
        cfg.isSecure = config.isSecure;
        cfg.rejectUnauthorized = config.rejectUnauthorized;
        cfg.headers = config.headers || {};
        cfg.ticket = config.ticket || false;
        cfg.key = config.key || null;
        cfg.cert = config.cert || null;
        cfg.ca = config.ca || null;
        cfg.pfx = config.pfx || null;
        cfg.passphrase = config.passphrase || null;
        cfg.identity = config.identity;
    }

    return cfg;
};