Backpack.FileUploadEditorIframeCounter = 0;
/**
 * @class Backpack.FileUploadEditor
 * @description Class to upload files
 * @extends Backpack.CollectionEditor
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
 */
Backpack.FileUploadEditor = new Class({
    Extends: Backpack.CollectionEditor,
    _tempid: false,

    _currentTempFile: null,

    UPLOAD_ACTION: './index.php?api=gridfs&do=upload_temp',

    initialize: function(gui, bucket, docid, options) {
        this.addEvent('setcontent', function(file) {
            if ( file._historyid != null )
                this._historyid = file._historyid;

            this.viewFile(file);
        }.bind(this));

        this._bucket = bucket;

        this.parent(gui, bucket, docid, options);

        this.addEvents({
            'updateheight': function(newHeight) {
                this._ui.editor.setStyle('height', newHeight - this._ui.editor.getCoordinates().top + app.gui.options.headerHeight);
            }.bind(this)
        });
    },
    saveDocument: function(data, callback) {
        this.parent(data, function() {
            if ( !callback.apply(this, arguments) )
                return false;

            delete this._tempid;
            delete this._historyid;
            return true;
        }.bind(this));
    },
    initEditor: function(callback) {
        this.initFieldset();

        Backpack.FileUploadEditorIframeCounter++;
        this._ui.editor.setStyle('position', 'relative');
        this._ui.iframe      = new Element('iframe', {'display': 'none', 'name': 'imgiframe'+Backpack.FileUploadEditorIframeCounter, 'id': 'imgiframe'+Backpack.FileUploadEditorIframeCounter});
        this._ui.content     = new Element('div', {'class': 'editor-contentgrid'});
        this._ui.upload      = new Element('div', {'class': 'editor-upload'});
        this._ui.form        = new Element('form', {'method': 'post', 'enctype': 'multipart/form-data', 'action': this.UPLOAD_ACTION});
        this._ui.filedlg     = new Element('input', {'type': 'file', 'name': 'upload', 'accept': this.parseContentTypeToInputAccept(this._schema.contenttype)});
        this._ui.submit      = new Element('button', {
            'type': 'button',
            'disabled': true,
            'class': 'btn btn-info',
            'html': '<span class="glyphicon glyphicon-upload"></span> Upload',
            'info': 'Choose file first'
        });
        this._ui.progress    = new Element('progress', {'class': 'hidden', 'value': '0', 'max': '100'});
        this._ui.form.set('target', 'imgiframe' + Backpack.FileUploadEditorIframeCounter);

        this._ui.editor.adopt([
            this._ui.iframe,
            this._ui.content,
            this._ui.upload.adopt(
                this._ui.progress,
                this._ui.form.adopt([
                    this._ui.filedlg,
                    this._ui.submit
                ])
            )
        ]);

        this.resetFileContentElement();

        this._ui.filedlg.addEvent('change', function() {
            var inputFile = this._ui.filedlg.files[0];
            if ( inputFile == null ) {
                this._ui.submit.set('disabled', true);
            } else {
                this._ui.submit.erase('disabled');
            }

        }.bind(this));

        this._ui.submit.addEvent('click', function() {
            var inputFile = this._ui.filedlg.files;
            if ( inputFile == null ) {
                this._ui.filedlg.setStyle('color', 'red');
                return;
            }
            this.processFiles(inputFile);
        }.bind(this));

        this.addEvent('setfile', function(index, file) {
            console.log('setfile', index);
            this.previewFile(file, index);

            if ( this._docid == null ) {
                if ( this.form.identifier.get('value') === '' ||
                    (this._currentTempFile != null && this.form.identifier.get('value') == this._currentTempFile.name) )
                    this.form.identifier.set('value', file.name);
            }
            this._currentTempFile = file;
            this._tempid = index;
        });

        if (callback != null)
            callback.call(this);
    },
    /*
     * @method previewFile
     * @param {file} file This is the javascript file object of the <input type="file"/>.
     */
    previewFile: function(file, index) {
        this.resetFileContentElement();
        if ( file.type.indexOf('image') === 0 ) {
            this._ui.filecontent.setStyle('background', 'url("./index.php?api=gridfs&do=load_temp&index='+index+'") center no-repeat, '+
                '#B3B3B3 url("assets/img/grid16.png") left top repeat'
            );

        } else {
            this._ui.filecontent.adopt(new Element('div', {
                'html': 'No preview available for file ' + file.name,
                'style': 'padding-top: 20px'
            }));
        }
    },
    /*
     * @method previewFile
     * @param {file} file This is the gridfs file object.
     */
    viewFile: function(file) {
        this.resetFileContentElement();
        this.form.identifier.set('value', file.identifier == undefined ? file.filename : file.identifier);

        var bucket = this._bucket;
        var id = file._id;
        if ( this.options.historyIndex !== false ) {
            bucket += '.history';
            id = file._historyid;
        }

        if ( file.mimetype.indexOf('image') === 0 ) {
            this._ui.filecontent.setStyle(
                'background', 'url("./index.php?api=gridfs&do=preview_file&bucket=' + bucket + '&index=' + id + '") center no-repeat, '+
                '#B3B3B3 url("assets/img/grid16.png") left top repeat'
            );

        } else {
            this._ui.filecontent.adopt(new Element('div', {
                'html': 'No preview available for file ' + file.filename,
                'style': 'padding-top: 20px'
            }));
        }
        if (typeof this.fieldset != 'undefined')
            this.fieldset.setValues(file);
    },
    getData: function() {
        var data = this.parent();
        if (!data)
            return;

        if (this._tempid)
            data._tempid = this._tempid;

        if (this._historyid)
            data._historyid = this._historyid;

        return data;
    },
    resetFileContentElement: function(empty) {
        this._ui.dropinfo = new Element('div', {'class': 'dropinfo', 'html': 'Choose file or drop at grid area.'});
        this._ui.filecontent = new Element('div', {'class': 'editor-filecontent'});
        this._ui.content.empty();
        this._ui.content.adopt(this._ui.filecontent);
        this._ui.filecontent.adopt(this._ui.dropinfo);

        var root = this;
        this._ui.filecontent.ondragover = function() {
            return false;
        };
        this._ui.filecontent.ondragenter = function() {
            root._ui.dropinfo.addClass('hover');
            return false;
        };
        this._ui.filecontent.ondragleave = function() {
            root._ui.dropinfo.removeClass('hover');
            return false;
        };
        this._ui.filecontent.ondragend = function() {
            root._ui.dropinfo.removeClass('hover');
            return false;
        };
        this._ui.filecontent.ondrop = function(event) {
            root._ui.dropinfo.removeClass('hover');
            event.stopPropagation();
            event.preventDefault();

            root.processFiles(event.dataTransfer.files);
        };
    },
    parseContentTypeToInputAccept: function(ct) {
        if ( ct == null || ct === '' )
            return '';

        if ( ct.trim() == 'file' )
            return '';

        var s = ct.split(':');
        if ( s.length < 2 )
            return '';

        return s[1];
    },

    parseUploadResponse: function(raw, inputFile) {
        var m = raw.match(/guhdruigbhnditughnnfuidbvbhdf(.*)JGBIGBUIGIUGUIGIZUFUZFUKZ/);
        if (m != null) {
            var json = m.pop();
            var res = JSON.decode(json);

            if (res.result != null) {
                this.fireEvent('setfile', [res.result, inputFile]);
                this._ui.progress.addClass('hidden');
            } else if (res.error != null) {
                app.gui.showMessage(res.error, 'error');
                console.log('Upload error', res.error);
            } else {
                app.gui.showMessage('Missing request result: ' + json, 'error');
                console.log('Missing request result', json);
            }
        } else {
            app.gui.showMessage('Invalid request result: ' + raw, 'error');
            console.log('Invalid request result', raw);
        }

    },

    /**
     * @description Upload the given files via ajax.
     * @param File[] files Array of the uploaded files objects.
     **/
    processFiles: function(files, callback) {
        if ( files.length > 1 ) {
            app.gui.showMessage('Only one file is allowed.', 'error');
            return;
        }

        var formData = new FormData();

        this._ui.submit.set('disabled', true);

        this._ui.progress.set('value', 0);
        this._ui.progress.removeClass('hidden');

        var file = files[0];
        formData.append('upload', file);

        var self = this;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', this.UPLOAD_ACTION);
        xhr.onload = function() {
            if ( this.status != 200 ) {
                app.gui.showMessage('Upload error: ' + this.status, 'error');
                console.log('Upload error', this.status);
                return;
            }

            self._ui.progress.set('value', 100);
            self._ui.progress.set('html', '100%');
            self.parseUploadResponse(this.responseText, file);

            self._ui.filedlg.erase('value');
            self._ui.filedlg.setStyle('color', 'inherit');

            if ( callback )
                callback();
        };

        Request.onerror = function(event) {
            app.gui.showMessage(res.error, 'error');
            console.log('Upload error', res.error);
        };

        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                var complete = (event.loaded / event.total * 100 | 0);
                self._ui.progress.set('value', complete);
                self._ui.progress.set('html', complete+'%');
            }
        }
        xhr.send(formData);
    }
});

