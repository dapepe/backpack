var FileApi = {
	list: function(dir, query, onSuccess, onFailure) {
		return app.request({
			'api' : 'file',
			'do'  : 'list',
			'dir': dir,
			'query': query
		}, onSuccess, onFailure);
	},
	add: function(file, isDir, onSuccess, onFailure) {
		return app.request({
			'api'    : 'file',
			'do'     : 'add',
			'file'   : file,
			'is_dir' : isDir ? 1 : 0
		}, onSuccess, onFailure);
	},
	read: function(file, onSuccess, onFailure) {
		return app.request({
			'api' : 'file',
			'do'  : 'read',
			'file': file
		}, onSuccess, onFailure);
	},
	write: function(file, content, onSuccess, onFailure) {
		return app.request({
			'api'    : 'file',
			'do'     : 'write',
			'file'   : file,
			'content': content
		}, onSuccess, onFailure);
	},
	remove: function(file, onSuccess, onFailure) {
		return app.request({
			'api'  : 'file',
			'do'   : 'remove',
			'file' : file
		}, onSuccess, onFailure);
	},
	thumbnail: function(file, onSuccess, onFailure) {
		return app.request({
			'api' : 'file',
			'do'  : 'thumbnail',
			'file': file
		}, onSuccess, onFailure);
	}
};
