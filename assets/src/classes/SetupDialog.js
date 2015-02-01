/**
 * Activation overview
 *
 * @author Peter-Christoph Haider <peter.haider@zeyos.com>
 * @version 1.00
 * @package Backpack
 * @copyright Copyright (c) 2014, Zeyon GmbH & Co. KG
 */
Backpack.SetupDialog = new Class({
    Extends: gx.core.Settings,
    'initialize': function(options) {
        this.parent(options);

        // Initialize the popup window
        this.body   = new Element('div', {'styles': {'height': '300px'}});
        this.footer = new Element('div');
        this.dropup = new gx.bootstrap.Popup({
            'width'   : 600,
            'closable': true,
            'content': this.body,
            'footer': this.footer,
            'onShow': function() {
                this.fireEvent('show');
            }.bind(this)
        });

        // Build the "list user" view
        this.table = __({'tag': 'table', 'class': 'table', 'child': {'tag': 'thead', 'child': {'tag': 'tr', 'children': [
            {'tag': 'th', 'html': '#', 'width': '50'},
            {'tag': 'th', 'html': 'Username'},
            {'tag': 'th', 'html': ''}
        ]}}});
        this.tbody = new Element('tbody');
        this.table.adopt(this.tbody);
        this.btnNew = new Element('button', {'class': 'btn btn-success', 'html': '<span class="glyphicon glyphicon-plus-sign mright-10"></span>New user'});
        this.btnNew.addEvent('click', function() {
            this.addUser();
        }.bind(this));
        this.btnClose = new Element('button', {'class': 'btn btn-default left', 'html': '<span class="glyphicon glyphicon-remove mright-10"></span>Close'});
        this.btnClose.addEvent('click', function() {
            this.hide();
        }.bind(this));

        // Build the "add user" view
        this.txtUsername = new gx.bootstrap.Field({
            'label'  : 'Username',
            'type'   : 'text',
            'width'	 : 300
        });
        this.txtPassword = new gx.bootstrap.Field({
            'label'  : 'Password',
            'type'   : 'password',
            'width'	 : 300
        });
        this.txtRepeat = new gx.bootstrap.Field({
            'label'  : 'Repeat',
            'type'   : 'password',
            'width'	 : 300
        });
        this.form = new gx.bootstrap.Form();
        this.fieldset = new gx.bootstrap.Fieldset();
        this.form.addFieldset(this.fieldset);
        this.fieldset.addFieldItem('username', this.txtUsername);
        this.fieldset.addFieldItem('password', this.txtPassword);
        this.fieldset.addFieldItem('repeat', this.txtRepeat);
        this.colLeft  = new Element('div', {'class': 'col-md-4 col-xs-4 col-sm-4 a-c'});
        this.colRight = new Element('div', {'class': 'col-md-8 col-xs-8 col-sm-8'});
        this.btnAddUser = new Element('button', {'class': 'btn btn-primary', 'html': '<span class="glyphicon glyphicon-ok mright-10"></span>Ok'});
        this.btnAddUser.addEvent('click', function() {
            var data = this.form.getValues();
            if (data.password != data.repeat) {
                alert('Passwords do not match!');
                return;
            }
            UserApi.update(data.username, data.password, function() {
                this.listUsers();
            }.bind(this));
        }.bind(this));
        this.btnBack = new Element('button', {'class': 'btn btn-default left', 'html': '<span class="glyphicon glyphicon-chevron-left mright-10"></span>Back'});
        this.btnBack.addEvent('click', function() {
            this.listUsers();
        }.bind(this));
    },

    listUsers: function() {
        this.body.empty();
        this.tbody.empty();

        this.body.adopt(this.table);
        UserApi.list(function(users) {
            var c = 0;
            users.each(function(user) {
                c++;
                var link = new Element('a', {'html': '<span class="glyphicon glyphicon-user mright-10"></span>' + user.user})
                    .addEvent('click', function() {
                        this.addUser(user.user);
                    }.bind(this));

                var btnRemove = new Element('button', {'class': 'btn btn-xs btn-danger', 'html': '<span class="glyphicon glyphicon-trash mright-10"></span>Remove'})
                    .addEvent('click', function() {
                        if (!confirm('Do you really want to remove this user'))
                            return;

                        UserApi.remove(user._id, function() {
                            this.listUsers();
                        }.bind(this));
                    }.bind(this));

                this.tbody.adopt(__({'tag': 'tr', 'children': [
                    {'tag': 'td', 'html': c},
                    {'tag': 'td', 'child': link},
                    {'tag': 'td', 'class': 'a-r', 'child': btnRemove}
                ]}));
            }.bind(this));
        }.bind(this));

        this.dropup.setTitle('Users');
        this.footer.empty();
        this.footer.adopt([this.btnClose, this.btnNew]);
    },

    addUser: function(username) {
        this.body.empty();
        this.form.reset();
        this.body.adopt(this.form.display());

        if (username == null) {
            this.txtUsername.setDisabled(false);
            this.dropup.setTitle('Add user');
        } else {
            this.txtUsername.setDisabled(true);
            this.txtUsername.setValue(username);
            this.dropup.setTitle('Update user');
        }

        this.footer.empty();
        this.footer.adopt([this.btnBack, this.btnAddUser]);
    },

    show: function() {
        this.dropup.show();
        this.listUsers();
        this.fireEvent('show');
    },

    hide: function() {
        this.dropup.hide();
    }
});
