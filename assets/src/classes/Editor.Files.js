/**
 * @class Backpack.FileEditor
 * @description Class to edit regular files
 * @extends Backpack.Editor
 *
 * @author Peter-Christoph Haider <peter.haider@zeyos.com>
 * @version 1.00
 * @package Backpack
 * @copyright Copyright (c) 2014, Zeyon GmbH & Co. KG
 *
 * @param {object} gui
 * @param {object} file
 * @param {object} options
 */
Backpack.FileEditor = new Class({
    Extends: Backpack.Editor,
    initialize: function(gui, file, options) {
        this._file = file;
        this._file.extension += ''; // Make sure, file.extension is a string
        this._file.extension = this._file.extension.toLowerCase();

        this.parent(gui, options);

        this.initMenu();
        this.initEditor(function() {
            this.initTab(file.filename, file.extension == null ? undefined : 'file-'+file.extension);

            if (this._file.path != null)
                this.load();

            this.updateHeight();
        });
    },
    initEditor: function(callback) {
        if (this.options.ckeditor && (this._file.extension == 'html' || this._file.extension == 'html')) {
            this.initCkEditor(callback);
        }

        this.initAceEditor(this._file.extension, callback);
    },
    load: function() {
        FileApi.read(this._file.path, function(content) {
            this.fireEvent('setcontent', [{'content': content}]);
        }.bind(this));
    },
    save: function() {
        if (this._file != null) {
            if (content !== false)
                FileApi.write(this._file.path, this.getEditorValue(), function() {
                    app.gui.showMessage('File saved!', 'success');
                    this.fireEvent('save');
                }.bind(this));
        }
    },
    remove: function() {
        if (confirm('Do you really want to remove this file?')) {
            FileApi.remove(this._file.path, function() {
                app.gui.showMessage('File removed!', 'removed');
                this.close();
                this.fireEvent('remove');
            }.bind(this));
        }
    }
});