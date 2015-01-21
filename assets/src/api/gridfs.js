var GridFSApi = {
	listBuckets: function(onSuccess, onFailure) {
		return app.request({
			'api'        : 'gridfs',
			'do'         : 'list_buckets'
		}, onSuccess, onFailure);
	},
	showBucket: function(bucket, onSuccess, onFailure) {
		return app.request({
			'api'        : 'gridfs',
			'do'         : 'show_bucket',
			'bucket'     : bucket
		}, onSuccess, onFailure);
	},
	listFiles: function(bucket, query, sort, onSuccess, onFailure) {
		return app.request({
			'api'        : 'gridfs',
			'do'         : 'list_files',
			'bucket'     : bucket,
			'query'      : query,
			'sort'       : sort
		}, onSuccess, onFailure);
	},
    identifyFile: function(bucket, index, onSuccess, onFailure) {
        return app.request({
            'api'        : 'gridfs',
            'do'         : 'identify_file',
            'bucket'     : bucket,
            'index'      : index
        }, onSuccess, onFailure);
    },
	showFile: function(bucket, index, history, onSuccess, onFailure) {
		return app.request({
			'api'        : 'gridfs',
			'do'         : 'show_file',
			'bucket'     : bucket,
			'index'      : index,
			'history'    : history
		}, onSuccess, onFailure);
	},
	downloadFile: function(bucket, index, onSuccess, onFailure) {
		return app.request({
			'api'        : 'gridfs',
			'do'         : 'download_file',
			'bucket'     : bucket,
			'index'      : index
		}, onSuccess, onFailure);
	},
	saveFile: function(bucket, data, onSuccess, onFailure) {
		return app.request({
			'api'        : 'gridfs',
			'do'         : 'save_file',
			'bucket'     : bucket,
			'data'       : data
		}, onSuccess, onFailure);
	},
	removeFile: function(bucket, index, onSuccess, onFailure) {
		return app.request({
			'api'        : 'gridfs',
			'do'         : 'remove_file',
			'bucket'     : bucket,
			'index'      : index
		}, onSuccess, onFailure);
	},
	restoreFile: function(bucket, index, onSuccess, onFailure) {
		return app.request({
			'api'        : 'gridfs',
			'do'         : 'restore_file',
			'bucket'     : bucket,
			'index'      : index
		}, onSuccess, onFailure);
	},
	loadTemp: function(index, onSuccess, onFailure) {
		return app.request({
			'api'        : 'gridfs',
			'do'         : 'load_temp',
			'index'      : index
		}, onSuccess, onFailure);
	},
	restoreHistory: function(bucket, index, historyIndex, onSuccess, onFailure) {
		return app.request({
			'api'        : 'gridfs',
			'do'         : 'restore_history',
			'bucket'     : bucket,
			'index'      : index,
			'historyidx' : historyIndex
		}, onSuccess, onFailure);
	}
};
