/**
 * Activation overview
 *
 * @author Peter-Christoph Haider <peter.haider@zeyos.com>
 * @version 1.00
 * @package Backpack
 * @copyright Copyright (c) 2014, Zeyon GmbH & Co. KG
 */
Backpack.LoginDialog = new Class({
	Extends: gx.core.Settings,
	'initialize': function(options) {
		this.parent(options);

		this.txtUsername = new gx.bootstrap.Field({
			'label'      : 'Username',
			'type'       : 'text',
            'placeholder': 'username@database',
			'width'	     : 300
		});
		this.txtPassword = new gx.bootstrap.Field({
			'label'  : 'Password',
			'type'   : 'password',
			'width'	 : 300
		});
		this.txtUsername._display.field.addEvent('keydown', function(event) {
			if (event.key == 'enter')
				this.login();
		}.bind(this));
		this.txtPassword._display.field.addEvent('keydown', function(event) {
			if (event.key == 'enter')
				this.login();
		}.bind(this));

		this.cbxRemember = new gx.bootstrap.CheckButton(new Element('div', {'class': 'left'}), {'size': 'mini', 'label': 'Stay logged-in for 2 weeks'});
		this.form = new gx.bootstrap.Form();
		this.fieldset = new gx.bootstrap.Fieldset();
		this.form.addFieldset(this.fieldset);
		this.fieldset.addFieldItem('username', this.txtUsername);
		this.fieldset.addFieldItem('password', this.txtPassword);

		this.dropup = new gx.bootstrap.Popup({
			'width'   : 600,
			'closable': false,
			'content': __({'class': 'row', 'children': [
                {'class': 'col-md-4 col-xs-4 col-sm-4 a-c', 'child': {'tag': 'img', 'class': 'img-responsive', 'src': './assets/img/backpack.png'}},
                {'class': 'col-md-8 col-xs-8 col-sm-8', 'children': [
                    {'class': 'pbottom-30 f-b', 'html': 'Welcome to the Backpack CMS. Please login:'},
                    this.form
                ]}
			]}),
			'footer': [
				__({'tag': 'button', 'class': 'btn btn-primary', 'html': '<span class="glyphicon glyphicon-log-in mright-10"></span>Login', 'onClick': function() {
					this.login();
				}.bind(this)}),
                this.cbxRemember
			],
			'onShow': function() {
				this.txtUsername._display.field.focus();
			}.bind(this)
		});
	},

	login: function() {
		this.fireEvent('login', {
			'username': this.txtUsername.getValue(),
			'password': this.txtPassword.getValue(),
			'cookie'  : this.cbxRemember.get()
		});
	},

	show: function(loginName, loginPassword, msg) {
		this.txtUsername.setValue(loginName);
		this.txtPassword.setValue(loginPassword);
		this.dropup.show();
	},

	hide: function() {
		this.dropup.hide();
	}
});
