var mailsocket_port = '/tmp/ccmed.sock';

exports.hook_queue = function (next, connection) {
    this.loginfo("New inbound email detected, forwarding to ccmed server.");
    var transaction = connection.transaction;
    var net = require("net");
    var s = new net.Socket();
    var self = this;

    s.connect(mailsocket_port,'localhost');
    s.on("data", function(data) {
      self.loginfo("MAIL PROCESSOR data received:", data.toString());
    });

    s.write(JSON.stringify(transaction));
    s.end();
    next();
}
