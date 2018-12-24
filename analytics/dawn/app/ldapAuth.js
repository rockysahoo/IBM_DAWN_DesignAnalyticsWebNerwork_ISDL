/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var exports = module.exports = {};

/*
 * passport-ldapauth
 * This section is for the passport ldap auth section.
 * It uses passport strategy's with the express server
 * to Authenticate against LDAP, and creates relevent
 * session data.
 */
// Define LDAP Strategy:
exports.LdapAuthenticator = function() {
    this.LDAP_OPTS = {
        server: {
            url:              'ldap://bluepages.ibm.com:389',
            bindDn:           '',
            bindCredentials:  '',
            searchBase:       'ou=bluepages,o=ibm.com',
            searchFilter:     '(emailaddress={{username}})',
            searchAttributes: ['emailaddress', 'sn', 'givenName', 'cn']
            
//            usernameField:    'username',
//            passwordField:    'password'
        }
    };

    this.passport      = require('passport');
    this.LdapStrategy = require('passport-ldapauth');
    this.bodyParser    = require('body-parser');
}

/**
   Method: initialize
   Description: Initialize the LDAP authentication service.
   See also: app.js where this method is called.
*/
exports.LdapAuthenticator.prototype.initialize = function(app){
    // Set up LDAP authentication service

    this.passport.use(new this.LdapStrategy(this.LDAP_OPTS));

    this.passport.serializeUser(function(user, done) {        
      done(null, user);
    });

    this.passport.deserializeUser(function(user, done) {
      done(null, user);
    });

    app.use(this.bodyParser.json());
    app.use(this.bodyParser.urlencoded({extended: false}));
    app.use(this.passport.initialize());
};

