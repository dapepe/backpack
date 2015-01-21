/**
 * @class Backpack.DocumentEditor
 * @description Class to edit MongoDB Documents
 * @extends Backpack.CollectionEditor
 *
 * @author Peter-Christoph Haider <peter.haider@groupion.com>
 * @version 1.00
 * @package XRay
 * @copyright Copyright (c) 2013, Zeyon GmbH & Co. KG
 *
 * @param {object} gui
 * @param {object} collection
 * @param {object} docid
 * @param {object} options
 */
Backpack.DocumentEditor = new Class({
    Extends: Backpack.CollectionEditor,
    initEditor: function(callback) {
        this.initFieldset();
        if (this._schema.contenttype != null) {
            switch (this._schema.contenttype) {
                case 'html':
                    this.initCkEditor(callback);
                    break;
                case 'raw':
                    this.initAceEditor('json', callback);
                    break;
                case 'none':
                    callback();
                    // Sometimes no editor is required, e.g. when you only edit meta data
                    break;
                default:
                    this.initAceEditor(this._schema.contenttype, callback);
                    break;
            }
        }
    },
    getData: function() {
        var data = this.parent();
        if (!data)
            return;

        data.content = this.getEditorValue();
        return data;
    }
});
