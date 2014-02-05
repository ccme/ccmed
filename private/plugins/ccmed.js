var mailsocket_port = '/tmp/ccmed.sock';

exports.hook_data = function (next, connection) {
    var plugin = this;
    var transaction = connection.transaction;
    transaction.parse_body = 1;
    transaction.notes.attachment_ctypes = [];
    transaction.notes.attachment_files = [];
    transaction.attachment_hooks(function (ctype, filename, body) {
        // Parse Content-Type
        var ct
        if ((ct = ctype.match(/^([^\/]+\/[^;\r\n ]+)/)) && ct[1]) {
            connection.logdebug(plugin, 'found content type: ' + ct[1]);
            transaction.notes.attachment_ctypes.push(ct[1]);
        }
        if (filename) {
            connection.logdebug(plugin, 'found attachment file: ' + filename);
            transaction.notes.attachment_files.push(filename);
        }
    });
    return next();
}   


exports.hook_queue = function (next, connection) {
    this.loginfo("New inbound email detected, forwarding to ccmed server.");
    var transaction = connection.transaction;
    var email = {};

    email.header_list = transaction.header.header_list;
    email.headers_decoded = transaction.header.headers_decoded;
    email.bodytext = transaction.body.bodytext;
    email.body_text_encoded = transaction.body.body_text_encoded;
    debugger;

    var net = require("net");
    var s = new net.Socket();
    var self = this;

    s.connect(mailsocket_port,'localhost');
    s.on("data", function(data) {
      self.loginfo("MAIL PROCESSOR data received:", data.toString());
    });

    s.write(JSON.stringify(email));
    s.end();
    next();
}
