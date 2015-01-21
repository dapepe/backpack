Backpack.EditorTitle = {
    _counter: {},
    get: function(collection, schema) {
        var name = ucfirst(collection);
        if (schema != undefined && schema.label != undefined && schema.label.singular != undefined)
            name = schema.label.singular;
        var title = 'New ' + name;
        if (Backpack.EditorTitle._counter[collection] == null) {
            Backpack.EditorTitle._counter[collection] = 1;
        } else {
            Backpack.EditorTitle._counter[collection]++;
            title += ' ' + Backpack.EditorTitle._counter[collection];
        }
        return title;
    }
};

/**
 * @class Backpack.Editor
 * @description Abtract class to create an Editor instance
 * @implements Options
 * @implements Events
 *
 * @author Peter-Christoph Haider <peter.haider@zeyos.com>
 * @version 1.00
 * @package Backpack
 * @copyright Copyright (c) 2014, Zeyon GmbH & Co. KG
 *
 * @param {object} gui
 * @param {object} options
 */
Backpack.Editor = new Class({
    Extends: gx.ui.Container,
    options: {
        type: 'plain',
        viewonly: false
    },
    _details: {
        'comment': {
            'label': 'Comment'
        },
        'creator': {
            'label' : 'Creator'
        },
        'modifier': {
            'label' : 'Last modifier'
        },
        'creationdate': {
            'label': 'Creationdate',
            'value': function(doc, identifier) {
                if (doc == null)
                    return;

                return formatDate(doc[identifier]);
            }
        },
        'lastmodified': {
            'label': 'Last modified',
            'value': function(doc, identifier) {
                if (doc == null)
                    return;

                return formatDate(doc[identifier]);
            }
        },
        'published': {
            'label' : 'Public',
            'value' : function(doc, identifier) {
                this.field = new gx.bootstrap.CheckButton(null, {
                    'value' : doc != null && doc[identifier],
                    'size'  : 'xs',
                    'label' : ['Public', 'Draft']
                });

                return this.field;
            },
            'getValue': function() {
                return this.field.get();
            }
        }
    },
    fieldset: null,
    _docid: null,
    _file: null,
    _tab: null,
    editor: null,
    offsetEditor: 0,
    initialize: function(gui, options) {
        this.parent(new Element('div', {'class': 'editor-frame'}), options);
        this.gui = gui;

        this.addEvent('show', function() {
            this._ui.root.addClass('active');
        }.bind(this));
        this.addEvent('hide', function() {
            this._ui.root.removeClass('active');
        }.bind(this));

        this.gui.addEvent('updateheight', function(newHeight) {
            this.updateHeight(newHeight);
        }.bind(this));

        // Initialize the editor frame
        this._ui.editor = new Element('div', {'class': 'editor'}).inject(this._ui.root);
    },
    initTab: function(label, icon) {
        this._tab = this.gui.addTab(
            label,
            function() {
                this.fireEvent('tabopen');
            }.bind(this),
            function() {
                this.fireEvent('tabclose');
            }.bind(this),
            this,
            icon
        );
    },
    /* abstract */ initEditor: function() {},
    initMenu: function() {
        // Button bar
        this._ui.bar = __({'class': 'editor-bar', 'children': {
            'buttons': {'class': 'right', 'children': {
                'btnSave': {
                    'tag': 'button',
                    'class': 'btn btn-primary',
                    'html': '<span class="glyphicon glyphicon-ok-sign"></span> Save',
                    'onClick': function() {
                        this.save();
                    }.bind(this)
                },
                'btnRemove': {
                    'tag': 'button',
                    'class': 'btn btn-danger',
                    'html': '<span class="glyphicon glyphicon-trash"></span> Remove',
                    'onClick': function() {
                        this.remove();
                    }.bind(this)
                }
            }},
            'clear': {'class': 'clear'}
        }}).inject(this._ui.root, 'top');

        if ( this.options.viewonly === true ) {
            this._ui.bar._buttons._btnSave.set('disabled', true);
            this._ui.bar._buttons._btnRemove.set('disabled', true);
        }
    },
    initAceEditor: function(filetype, callback) {
        // Common text editor
        this.editor = ace.edit(this._ui.editor);
        this.editor.setTheme("ace/theme/monokai");
        var editorMode = 'text';
        // Assign the editor mode
        switch (filetype) {
            case 'css':
                editorMode = 'css';
                break;
            case 'txt':
                editorMode = 'text';
                break;
            case 'less':
                editorMode = 'less';
                break;
            case 'md':
                editorMode = 'markdown';
                break;
            case 'js':
                editorMode = 'javascript';
                break;
            case 'json':
                editorMode = 'json';
                break;
            case 'xml':
            case 'ixml':
                editorMode = 'xml';
                break;
            case 'html':
            case 'htm':
                editorMode = 'html';
                break;
            default:
                throw new Error('Unsupported file type');
        }
        this.editor.getSession().setMode('ace/mode/'+editorMode);

        this.addEvents({
            'updateheight': function(newHeight) {
                this._ui.editor.setStyle('height', newHeight - this._ui.editor.getCoordinates().top + app.gui.options.headerHeight);
                this.editor.resize(1);
            }.bind(this),
            'show': function() {
                this.editor.focus();
            }.bind(this),
            'setcontent': function(doc) {
                this.editor.setValue(doc.content, -1);
            }.bind(this)
        });
        if (callback != null)
            callback.call(this);
    },
    initCkEditor: function(callback) {
        // HTML WYSISYG Editor
        this._ui.editorTextarea = new Element('textarea').inject(this._ui.editor);
        this.editor = CKEDITOR.replace(this._ui.editorTextarea, {
            filebrowserImageBrowseUrl : 'index.php?view=ckselector',
            filebrowserWindowWidth : '640',
            filebrowserWindowHeight : this.gui.currentHeight
        });
        this.editor.on('instanceReady', function(){
            var ckFrame    = this._ui.editor.getElement('.cke'),
                ckInner    = ckFrame.getElement('.cke_inner').getElement('.cke_contents'),
                offset     = 7;

            this._ui.ckiframe = ckInner.getElement('iframe');

            this.addEvents({
                'show': function() {
                    ckInner.setStyle('height', this.gui._height - ckInner.getCoordinates().top + offset);
                }.bind(this),
                'updateheight': function(doc) {
                    ckInner.setStyle('height', this.gui._height - ckInner.getCoordinates().top + offset);
                }.bind(this),
                'setcontent': function(doc) {
                    this.editor.setData(doc.content);
                }.bind(this)
            });

            if (callback != null)
                callback.call(this);
        }.bind(this));
    },
    initFieldset: function() {
        // Initialize the properties fieldset

        this.fieldset = new gx.bootstrap.Fieldset(null, {
            horizontal: false
        });

        if (typeOf(this._schema.properties) == 'object' && Object.getLength(this._schema.properties) > 0) {
            Object.each(this._schema.properties, function(property, key) {
                if (property.type != null) {
                    if (property.type.match(/^reference:/))
                        property.type = new Backpack.Reference(null, property.type.split(':')[1]);

                    property.label = property.label == null ? key : property.label;
                    this.fieldset.addField(key, property.type, property);
                }
            }.bind(this));
        }

        // Initialize the primary document attributes
        this.form = {
            identifier        : new Element('input', {'type': 'text', 'class': 'form-control editor-title'}).inject(this._ui.bar, 'top'),
            identifierHelp    : new Element('span', {'class': 'help-inline'}),
            identifierControl : new Element('div', {'class': 'control-group'}),
            published         : new Element('input', {'type': 'checkbox'})
        };
        this.form.identifier.addEvent('blur', function() {
            this.set('value', this.get('value').replace(/[^a-z0-9_-]/i, '').toLowerCase());
        });

        if (this.options.identifier != null && this.options.identifier !== '') {
            this.form.identifier.set('value', this.options.identifier);
        }

        new Element('div', {'class': 'form-horizontal left editor-title'}).adopt(
            this.form.identifierControl.adopt([
                //new Element('label.control-label', {'html': '<b>Identifier</b>'}),
                new Element('div', {'class': 'controls'}).adopt([
                    this.form.identifier,
                    this.form.identifierHelp
                ])
            ])
        ).inject(this._ui.bar, 'top');

        // Initialize details panel
        this._ui.details = new Element('td', {'class': 'editor-details'});

        this.addEvent('show', function() {
            // this.updateFieldsetHeight();
            if (typeof this.fieldset != 'undefined') {
                this.options.offset = this.fieldset._ui.root.getSize().y + this.fieldset._ui.root.getPosition().y;
            }
        }.bind(this));

        this._ui.properties = __({'tag': 'table', 'child': {
            'tag': 'tr',
            'children': [
                {'tag': 'td', 'class': 'editor-properties', 'child': this.fieldset.display()},
                this._ui.details
            ]
        }}).inject(this._ui.editor, 'before');
    },
    highlightIdentifier: function(text) {
        if ( text == null || text == '' ) {
            this.form.identifierControl.removeClass('error');
            this.form.identifierHelp.set('html', '');

        } else {
            this.form.identifierControl.addClass('error');
            this.form.identifierHelp.set('html', text);
            this.form.identifier.focus();
        }
    },
    createDetails: function(doc) {
        if (this._schema.published == null)
            delete this._details['published'];

        if (this._schema.comment == null)
            delete this._details['comment'];

        this._ui.details.empty();

        Object.each(this._details, function(field, identifier) {
            if (field.label == null)
                return;

            var value;
            if (typeof field.value == 'function')
                value = field.value(doc, identifier, this._schema);
            else
                value = doc != null ? doc[identifier] : '';

            if ((typeof value == 'string' && value !== '')
                || (typeof value == 'object' && typeof value.display == 'function')
                || typeOf(value) == 'element'
            ) {
                this._ui.details.adopt(__({
                    'class': 'editor-details-field', 'children': [
                        {'tag': 'span', 'html': field.label + ': '},
                        (typeof value == 'string') ? new Element('div', {'html': value}) : value,
                        new Element('div.clear')
                    ]
                }));
            }
        }.bind(this));

        // Update the buttons
        if (doc != null && doc._deleted != null) {
            this._ui.bar._buttons._btnRemove.set('html', '<span class="glyphicon glyphicon-fire"></span> Delete');
            this._ui.bar._buttons.adopt(__({
                'tag': 'button',
                'class': 'btn btn-success',
                'html': '<span class="glyphicon glyphicon-share-alt"></span> Restore',
                'onClick': function() {
                    this.restore();
                }.bind(this)
            }));
        }
    },
    getDetailsValues: function(data) {
        var details = this._details;
        Object.each(this._details, function(field, identifier) {
            if ( typeOf(field) == 'object' && typeof field.getValue == 'function' ) {
                if ( data[identifier] == null )
                    data[identifier] = field.getValue();
                else
                    alert('It is not allowed to use the global property "'+identifier+'" and a'+
                    'property field with the same key in the same collection!');
            }
        }.bind(this));

        return data;
    },
    getEditorValue: function() {
        if (typeof this.editor == 'undefined' || this.editor == null)
            return null;
        if (typeof this.editor.getValue != 'undefined')
            return this.editor.getValue();
        else if (typeof this.editor.getData != 'undefined')
            return this.editor.getData();

        return null;
    },
    updateHeight: function(newHeight) {
        if (!this._ui.root.hasClass('active'))
            return;

        if (newHeight == null)
            newHeight = this.gui._height;

        this.fireEvent('updateheight', newHeight);
    },
    load: function() {
        this.fireEvent('load');
    },
    save: function() {
        this.fireEvent('save');
    },
    restore: function() {
        this.fireEvent('restore');
    },
    open: function() {
        if (this._tab != null)
            this._tab.open();
        this.fireEvent('open');
    },
    close: function() {
        if (this._tab != null)
            this._tab.close();
        this.fireEvent('close');
    }
});


