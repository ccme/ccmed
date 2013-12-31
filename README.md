ccmed
=====

ccMe Mail Server Daemon

An open, simple, secure, mail server and viewer in a single portable package.  It is the server that powers https://ccme.com/ and is open sourced (tho ccme.com has some features that are not part of the open source version).

Written in node.js and meteor.js, it is easy to install and simple to run.

Idea
-----
Think gmail, twitter, and github for encrypted secure email (s/mime).  HISP compliant with policy discovery.

Quick Install
-------------
OSX/Linux:

     curl https://raw.github.com/ccme/ccmed/master/install.sh | sh

Windows:

     https://raw.github.com/ccme/ccmed/master/install.bat

That's it.  You are now running a local version.

These scripts install meteor, git checkout the latest stable version, and run meteor.

Manual Install
--------------
* Unix:
  * Install meteor 
  * Install git
  * run meteor
* Windows:
  * Install meteor from https://github.com/sdarnell/meteor/wiki/Windows
  * install git
  * git clone https://github.com/ccme/ccmed.git
  * run meteor

Client UI Features
-------------------
* Email Address creation (multi-user).
  * Can register and create an email identity and make a private key.
  * Easy registration with ccme.com for forwarding a ccme handle to a local mail store.
  * Can mark address to be publically shared via ldap.
  * Can register server with ccme.com to be disoverable in other directories.
* Contact Managment 
  * A local store (with public key discovery and cache)
  * Remote lookup of email addresses and certificate display/verification.
  * Contacts can be marked to be shared with users within a ccmed server.
  * Public Key Discovery
    * HISP compliant key discovery.
* Message display
  * Multiple Folders per mailbox
  * Folders can be shared
* On startup:
  * Check git hub.  
  * If git is new, warn there is a newer version in UI.  (do a git pull)

Server Features
---------------
* Port: HTTP/S Server for UI
  * See above, but supports REST API for Messages
  * Policy discovery.
* Port: SMTP Server for Mail
  * Mail is rejected if not S/MIME compliant.
* Port: LDAP Server
  * Used to serve certificate discovery requests for addresses hosted my ccmed server.
  * Optionally shares meta data about the user.
* Port: DNS Server
* Port: IMAP  (future)

Collections
-----------
* address
* contacts
* messages
  * messageid, folderid[], content[]
* config
  * Root CA
    * Policy file to share to the world the address policies of the ccmed server.
  * Trust bundles
