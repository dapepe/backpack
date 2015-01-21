var CollectionApi = {
	listCollections: function(onSuccess, onFailure) {
		return app.request({
			'api'        : 'collection',
			'do'         : 'list_collections'
		}, onSuccess, onFailure);
	},
	getSchema: function(collection, onSuccess, onFailure) {
		return app.request({
			'api'        : 'collection',
			'do'         : 'get_schema',
			'collection' : collection
		}, onSuccess, onFailure);
	},
	listDocuments: function(collection, query, sort, onSuccess, onFailure) {
		return app.request({
			'api'        : 'collection',
			'do'         : 'list_documents',
			'collection' : collection,
			'query'      : query,
			'sort'       : sort
		}, onSuccess, onFailure);
	},
    identifyDocument: function(collection, index, onSuccess, onFailure) {
        return app.request({
            'api'        : 'collection',
            'do'         : 'identify_document',
            'collection' : collection,
            'index'      : index
        }, onSuccess, onFailure);
    },
	readDocument: function(collection, index, history, onSuccess, onFailure) {
		return app.request({
			'api'        : 'collection',
			'do'         : 'read_document',
			'collection' : collection,
			'index'      : index,
			'history'    : history
		}, onSuccess, onFailure);
	},
    writeDocument: function(collection, data, onSuccess, onFailure) {
		return app.request({
			'api'        : 'collection',
			'do'         : 'write_document',
			'collection' : collection,
			'data'       : data
		}, onSuccess, onFailure);
	},
	removeDocument: function(collection, index, onSuccess, onFailure) {
		return app.request({
			'api'        : 'collection',
			'do'         : 'remove_document',
			'collection' : collection,
			'index'      : index
		}, onSuccess, onFailure);
	},
	restoreDocument: function(collection, index, onSuccess, onFailure) {
		return app.request({
			'api'        : 'collection',
			'do'         : 'restore_document',
			'collection' : collection,
			'index'      : index
		}, onSuccess, onFailure);
	},
	restoreHistory: function(collection, index, historyIndex, onSuccess, onFailure) {
		return app.request({
			'api'        : 'collection',
			'do'         : 'restore_history',
			'collection' : collection,
			'index'      : index,
			'historyidx' : historyIndex
		}, onSuccess, onFailure);
	}
};
