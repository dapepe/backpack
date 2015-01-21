var UserApi = {
	login: function(params, onSuccess, onFailure) {
		app.request(Object.merge({
			'api': 'user',
			'do' : 'login'
		}, params), onSuccess, onFailure);
	},
	logout: function(onSuccess, onFailure) {
		app.request({
			'api': 'user',
			'do' : 'logout'
		}, onSuccess, onFailure);
	},
	session: function(onSuccess, onFailure) {
		app.request({
			'api': 'user',
			'do' : 'session'
		}, onSuccess, onFailure);
	},
	list: function(onSuccess, onFailure) {
		app.request({
			'api'   : 'user',
			'do'    : 'list'
		}, onSuccess, onFailure);
	},
	update: function(username, password, onSuccess, onFailure) {
		return app.request({
			'api'        : 'user',
			'do'         : 'update',
			'username'   : username,
			'password'   : password
		}, onSuccess, onFailure);
	},
	remove: function(uid, onSuccess, onFailure) {
		app.request({
			'api'  : 'user',
			'do'   : 'remove',
			'index': uid
		}, onSuccess, onFailure);
	}
};
