/**
 * @class Backpack.Api
 * @description Additional abstraction for the CollectionApi and GridFSApi
 * @implements Options
 * @implements Events
 *
 * @author Peter-Christoph Haider <peter.haider@zeyos.com>
 * @version 1.00
 * @package Backpack
 * @copyright Copyright (c) 2014, Zeyon GmbH & Co. KG
 *
 * @param {string} collection
 * @param {object} schema (Optional)
 * @param {object} options (Optional)
 */
Backpack.Api = new Class({
    Implements: [Options, Events],

    initialize: function (collection, options) {
        this.setOptions(options);
        this.identifier = collection;
        if (this.options.schema != null) {
            this._loadSchema(this.options.schema);
            return;
        }
        CollectionApi.getSchema(collection, function (schema) {
            this._loadSchema(schema);
        }.bind(this));
    },
    _loadSchema: function(schema) {
        this.name = ucfirst(this.identifier);
        if (schema.label != null && schema.label.plural != null)
            this.name = schema.label.plural;

        this.schema = schema;
        this.isFile = schema.contenttype != null && schema.contenttype.indexOf('file') === 0;

        this.fireEvent('ready', schema);
    },
    list: function (query, sort, onSuccess, onFailure) {
        if (this.isFile)
            return GridFSApi.listFiles(this.identifier, query, sort, onSuccess, onFailure);

        return CollectionApi.listDocuments(this.identifier, query, sort, onSuccess, onFailure);
    },
    identify: function(id, onSuccess, onFailure) {
        if (this.isFile)
            return GridFSApi.identifyFile(this.identifier, id, onSuccess, onFailure);

        return CollectionApi.identifyDocument(this.identifier, id, onSuccess, onFailure);
    },
    read: function (id, history, onSuccess, onFailure) {
        if (this.isFile)
            return GridFSApi.showFile(this.identifier, id, history, onSuccess, onFailure);

        return CollectionApi.readDocument(this.identifier, id, history, onSuccess, onFailure);
    },
    write: function (data, onSuccess, onFailure) {
        if (this.isFile)
            return GridFSApi.saveFile(this.identifier, data, onSuccess, onFailure);

        return CollectionApi.writeDocument(this.identifier, data, onSuccess, onFailure);
    },
    remove: function (id, onSuccess, onFailure) {
        if (this.isFile)
            return GridFSApi.removeFile(this.identifier, id, onSuccess, onFailure);

        return CollectionApi.removeDocument(this.identifier, id, onSuccess, onFailure);
    },
    restore: function (id, onSuccess, onFailure) {
        if (this.isFile)
            return GridFSApi.restoreFile(this.identifier, id, onSuccess, onFailure);

        return CollectionApi.restoreDocument(this.identifier, id, onSuccess, onFailure);
    },
    revert: function (id, historyIdx, onSuccess, onFailure) {
        if (this.isFile)
            return GridFSApi.restoreHistory(this.identifier, id, historyIdx, onSuccess, onFailure);

        return CollectionApi.restoreHistory(this.identifier, id, historyIdx, onSuccess, onFailure);
    }
});

