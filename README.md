ccmed
=====

ccMe Mail Server Daemon

An open, simple, secure, mail server and viewer in a single portable package.  It is the server that powers https://ccme.com/ and is open sourced (although ccme.com has some features that are not part of the open source version).

Written in node.js and meteor.js, it is easy to install and simple to run.

Idea
-----
Think gmail, twitter, skype, and github for encrypted secure email (s/mime).  It does not compete with gmail, twitter, skype, or github...  ccmed is only for encrypted message communication.

History
-------
ccmed was designed as a secure way to exchange e-mail for health care.  The great work of [The Direct Project](http://wiki.directproject.org/) lead to an emerging standard for encrypting messages for secure communications in health care.  It called for the creation of Health Information Service Providers, or HISPs, that would facilitate the exchange of health information in a secure way.  Since *The Direct Project* choose to use S/MIME as the method, it meant that regular old email systems could be used to transport health information.  The problem is that few email readers support S/MIME.

Does that mean ccmed is only for health care?  No!  

ccmed allows anyone to create their own secure email server that includes a message viewer which understands encrypted and signed messages... all in a single platform.  

ccMe.com
--------
ccMe.com has three purposes and is *not required* to use ccmed:

1. Free Hosted Solution. ccme.com is the free hosted version of ccmed.  ccme.com is an easy to remember email address.  It will allow users to freely use secure e-mail without having to setup their own HISP or ccmed.  It has an easy to remember name, and as a brand, everyone will know a ccme.com email address will only work with encrypted, signed, email.  So don't send spam to it since it will just be ignored.  And if you do spam, your certificates will get de-listed from anti-spam policy lists. 
2. Directory Services. It is the central node that caches all directory services for other ccmed servers that want to participate in name/company/org lookup functions.  The directory services of ccmed are distributed and hierarchical, but ccme.com rolls up all the addresses into a single global indexed and querable place.  It is important to note, that directory services are not required to run ccmed.  It is just an easy way to publish if you choose to use it.  It is also possible to run directory services within an organization and not publish to ccme.com.
3. Fair Play Policy Distribution.  ccmed allows groups to develop their own policies about fair play.  Owners of a policy can choose to list or de-list addresses (certificates) in the policy.  This will allow others who want to filter or block messages based on someone's adherence to the fair play policy.  The policies are distributed in the ccmed servers, but ccme.com will act as the central place to be notified of subscribed policy changes.

Quick Install
-------------
OSX/Linux:

     curl https://raw.github.com/ccme/ccmed/master/install.sh | sh

Windows:

     https://raw.github.com/ccme/ccmed/master/install.bat

That's it.  You are now running a local version.

These scripts install meteorite, git checkout the latest stable version, and run meteor.

Manual Install
--------------
* Unix:
  * Install meteorite
  * Install git
  * run meteorite
* Windows:
  * Install meteorite from https://github.com/sdarnell/meteor/wiki/Windows
  * install git
  * git clone https://github.com/ccme/ccmed.git
  * run meteorite

Client UI Features
-------------------
* Simple inbox functions [New, Read]
  * messages can be grouped by subject, thread, sender or by meta data:
    * selected mime header data
    * special meta data, for example [CDA](http://www.hl7.org/implement/standards/product_brief.cfm?product_id=258):  
      * Required: RecordTarget, Author, Custodian
      * Optional: DataEnterer, Informant, InformationRecipient, LegalAuthenticator, etc ...
* Folder metaphore (using tagging) called foldertags.  They basically work like folders and tags.
  * foldertags are random hashes.  Hashes can be shared to enable sharing of folders.
  * foldertags can contain document that are just other foldertags thus providing a hierarchy.
* [Responsive design](http://en.wikipedia.org/wiki/Responsive_web_design) for displaying for pocket, tablet, or desktop that is ADA compliant.
* Message handling:
  * Messages are stored encrypted, but can be optionally decrypted.  Signatures are retained.  
  * Support multiple message formats:
    * If messages are decrypted, meta data is extracted for the message for sorting and indexing messages.
      * For CDA, document header data becomes json attributes of the message.
      * Some care must be taken since messages can contain multiple patients.
  * Message forwarding:
    * If a message is fwd to an address on the same server:
      * it is simply added to their inbox and if encrypted, the symmetric key is encrypted for the receiver.
    * If a message is fwd to an address on another ccmed server:
      * it can be sent by reference, in which case a URL is sent.
      * if by value, normal SMTP S/MIME procedures are followed.
* Email address creation (multi-user).
  * can register and create an email identity and make a private key.
  * easy registration with ccme.com for forwarding a ccme handle to a local mail store.
  * can mark address to be publicly shared via LDAP.
  * can register server with ccme.com to be discoverable in other directories.
  * can upload an image to be displayed with cert lookup.
  * [MAYBE] can upload multiple certs for an address.  
    * IE: one cert for LOA 2, another with LOA3, or one signed by one CA, and other by yet another CA. 
* Contact management 
  * A local store (with public key discovery and cache)
  * Remote lookup of email addresses and certificate display/verification.
  * Contacts can be marked to be shared with users within a ccmed server.
  * Public key discovery
    * HISP compliant key discovery.
  * Gravitar lookup for email addresses, also gravitar-like lookup for ccme.com 
* On startup:
  * Check git hub.  
  * If git is new, warn there is a newer version in UI.  (do a git pull)

Message Formats
---------------
(TODO:for now, listed in priority order)
* text/plain
* [application/cda+xml](http://wiki.directproject.org/share/view/23044739?replyId=23097977)  
 * and others: application/cda.c37+xml  application/ccd.c32+xml application/ccd+xml
* multipart/signed
* application/pdf
* application/json
* text/x-markdown
* text/html (stripped of script tags)
* text/xml  and  application/xml
* text/csv
* application/EDI-X12 and application/EDIFACT
* application/zip  application/gzip
* [application/edi-hl7v2](http://wiki.hl7.org/index.php?title=Media-types_for_various_message_formats)


Server Features
---------------
* Port: HTTP/S Server for UI
  * See above, but supports REST API for Messages
  * Policy discovery.
* Port: SMTP Server for mail
  * Mail is rejected if not S/MIME compliant.
* Port: LDAP server
  * Used to serve certificate discovery requests for addresses hosted my ccmed server.
  * Optionally shares meta data about the user.
* Port: DNS server
* Port: IMAP  (future)

Document/Message Storage
------------------------
* http://docs.mongodb.org/manual/core/gridfs/
* https://github.com/CollectionFS/Meteor-CollectionFS
* MIME handling:
  * [smime-node](https://github.com/kachok/smime-node/blob/master/lib/smime-node.js) Node.js wrapper for OpenSSL S/MIME commands
  * [mailparser](https://github.com/andris9/mailparser) Decode mime formatted e-mails, but currently does not support signatures.
  * [Haraka](https://github.com/baudehlo/Haraka) - node based mail server.
    * [haraka-mongo](https://github.com/jamescowie/haraka-mongo) - Plugin to allow emails to be stored in Mongo DB  (needs a lot of work, but basically has the idea)
* Crypto notes:
  * Server using openssl: https://github.com/Obvious/ursa
  * Windows/Mac but complicated: http://kjur.github.io/jsrsasign/
  * Client and simpliler for signing: http://kjur.github.io/jsjws/  (but it wont read local key stores... i think)
  * Nice ASN.1 decoder. http://lapo.it/asn1js/

Collections
-----------
* address
* contacts
* documents
  * messageid, foldertags[], keys[], content[]
* config
  * Root CA
    * Policy file to share to the world the address policies of the ccmed server.
  * Trust bundles

