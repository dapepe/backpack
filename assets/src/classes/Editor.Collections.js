/**
 * @class Backpack.CollectionEditor
 * @description Abstract class to edit collection documents
 * @extends Backpack.Editor
 *
 * @author Peter-Christoph Haider <peter.haider@zeyos.com>
 * @version 1.00
 * @package Backpack
 * @copyright Copyright (c) 2014, Zeyon GmbH & Co. KG
 *
 * @param {object} gui
 * @param {object} collection
 * @param {object} docid
 * @param {object} options
 *
 */
Backpack.CollectionEditor = new Class({
    Extends: Backpack.Editor,
    options: {
        historyIndex: false // false or an index number of a history entity
    },

    initialize: function(gui, collection, docid, options) {
        this.parent(gui, options);

        this._collection = collection;
        this._docid      = docid;

        this.api = new Backpack.Api(collection, {
            'schema': this.options.schema,
            'onReady': function(schema) {
                this._schema = schema;

                this._isFile = schema.contenttype != null && schema.contenttype.indexOf('file') === 0;

                this.initMenu();

                this.initEditor(function() {
                    if (this.options.title == null)
                        this.options.title = Backpack.EditorTitle.get(collection, schema);

                    if (docid != null) {
                        this.readDocument(docid, function(doc) {
                            this.form.identifier.set('value', doc.identifier);
                            this.fireEvent('setcontent', [doc]);
                            if (typeof this.fieldset != 'undefined')
                                this.fieldset.setValues(doc);

                            this.createDetails(doc);
                        }.bind(this));
                    } else {
                        this.createDetails();
                    }

                    this.initTab(this.options.title, schema.icon == null ? 'chevron-right' : schema.icon);

                    this.addEvents({
                        'show': function() {
                            this.updateHeight();
                        }.bind(this)
                    });

                    this.fireEvent('editorready');
                }.bind(this));
            }.bind(this)
        });
    },
    save: function() {
        var data = this.getData();
        if (!data)
            return;

        this.saveDocument(data, this.saveCallback.bind(this));
    },
    saveCallback: function(docid) {
        if (this.fieldset != null && typeOf(docid) == 'object' && docid.validation != null && docid.validation === false) {
            this.fieldset.setHighlights(docid.warnings, 'error');
            return false;
        }

        this.fieldset.setHighlights();
        app.gui.showMessage('Document saved!', 'success');

        this._docid = docid;

        var label = this.form.identifier.get('value');

        this._tab.frame.removeClass('restoreHistory');
        this._ui.bar._buttons._btnSave.removeClass('btn-info');
        this.options.historyIndex = false;

        this._tab.label.set('html', label);

        this.readDocument(docid, function(doc) {
            this.createDetails(doc);
            this.fireEvent('save', [doc]);
        }.bind(this));

        return true;
    },
    getData: function() {
        var data = {};
        if (this.fieldset != null)
            data = this.fieldset.getValues();

        data = this.getDetailsValues(data);

        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                if (data[i] === null)
                    data[i] = ''; // Use empty strings intead of null, otherwise they will be ignored in requests
            }
        }

        data._id     = this._docid;
        data.identifier   = this.form.identifier.get('value');

        if (data.identifier === '') {
            this.highlightIdentifier('You have to specify an identifier!');
            return false;
        } else
            this.highlightIdentifier('');

        return data;
    },
    readDocument: function(docid, callback) {
        var collection = this._collection;
        if ( this.options.historyIndex !== false ) {
            var nestedcallback = callback;
            callback = function(doc) {
                doc = doc['_history'][this.options.historyIndex];

                nestedcallback(doc);
            }.bind(this);
        }

        this.api.read(
            docid,
            this.options.historyIndex !== false,
            callback
        );
    },
    saveDocument: function(data, callback) {
        this.api.write(data, callback);
    },
    remove: function() {
        if (confirm('Do you really want to remove this document?')) {
            this.api.remove(this._docid, function() {
                app.gui.showMessage('Document removed!', 'removed');
                this.close();
                this.fireEvent('remove');
            }.bind(this));
        }
    },
    restore: function() {
        if (confirm('Do you really want to restore this document?')) {
            this.api.restore(this._docid, function() {
                app.gui.showMessage('Document restored!', 'success');
                this.close();
                this.fireEvent('restore');
            }.bind(this));
        }
    },
    initTab: function(label, icon) {
        if ( this.options.historyIndex !== false ) {
            label += ' (' + this.options.historyIndex + ')';
        }

        this.parent(label, icon);

        if ( this.options.historyIndex !== false ) {
            this._tab.frame.addClass('restoreHistory');
        }
    },
    initMenu: function() {
        this.parent();

        if ( this.options.historyIndex !== false ) {
            this._ui.bar._buttons._btnSave.addClass('btn-info');
        }

    },
    restoreHistory: function() {
        this.api.restore_history(
            this._docid,
            this.options.historyIndex, function() {
                app.gui.showMessage('Document restored!', 'success');

                this.fireEvent('restorehistory');
            }.bind(this)
        );
    }
});

