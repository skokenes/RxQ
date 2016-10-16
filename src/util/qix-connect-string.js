export default function(config) {
    var cfg = {};
    // Copy properties + defaults
    if (config) {
        cfg.port = config.port;
        cfg.appname = config.appname || false;
        cfg.host = config.host;
        cfg.prefix = config.prefix || false;
        cfg.isSecure = config.isSecure;
        cfg.identity = config.identity;
        cfg.ticket = config.ticket;
    }

    return ConnectionString(cfg);
};

function ConnectionString(config) {

    // Define host
    var host = (config && config.host) ? config.host : 'localhost';
    // Define port
    var port;

    // Configure port if port is undefined
    if (config && config.host === undefined) {
        port = ':4848';
    } else {
        port = (config && config.port) ? ':' + config.port : '';
    };

    // Define secure vs. unsecure
    var isSecure = (config && config.isSecure) ? 'wss://' : 'ws://';
    
    // Prefix
    var prefix = config.prefix ? config.prefix : '/';

    if (prefix.slice(0, 1) !== '/') {
        prefix = '/' + prefix;
    };
    if (prefix.split('').pop() !== '/') {
        prefix = prefix + '/';
    };

    var suffix = config.appname ? 'app/' + config.appname : 'app/%3Ftransient%3D';
    var identity = (config && config.identity) ? '/identity/' + config.identity : '';
    var ticket = config.ticket ? '?qlikTicket=' + config.ticket : '';

    var url = isSecure + host + port + prefix + suffix + identity + ticket;

    return url;

}