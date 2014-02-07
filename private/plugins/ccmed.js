
var mailsocket_port = '/tmp/ccmed.sock';

exports.hook_queue = function (next, connection) {
    this.loginfo("New inbound email detected, forwarding to ccmed server.");
    var transaction = connection.transaction;
    var email = {};
    var net = require("net");
    var s = new net.Socket();
    var self = this;

    email.mail_from = transaction.mail_from;
    email.rcpt_to = transaction.rcpt_to;
    email.headers = transaction.header.headers;

    s.connect(mailsocket_port,'localhost');
    s.on("data", function(data) {
      self.loginfo("MAIL PROCESSOR data received:", data.toString());
    });
    s.once('close', function () {
//    s.end();
      return next(OK);
    });
    s.write('HEADER:'+JSON.stringify(email)+"\n");

    connection.transaction.message_stream.pipe(s, {dot_stuffing: true, ending_dot: true});
}
