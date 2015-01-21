/**
 * @class Backpack.GenericListEditor
 * @description Class to edit a generic lists
 * @extends Backpack.CollectionEditor
 *
 * @author Sebastian Glonner <sebastian.glonner@zeyon.net>
 * @version 1.00
 * @package XRay
 * @copyright Copyright (c) 2013, Zeyon GmbH & Co. KG
 *
 * @param {object} gui
 * @param {object} collection
 * @param {object} docid
 * @param {object} options
 */
Backpack.ListEditor = new Class({
    Extends: Backpack.CollectionEditor,

    _items: [],

    initialize: function(gui, collection, docid, options) {
        this.parent(gui, collection, docid, options);
        this.addEvents({
            'updateheight': function(newHeight) {
                this._ui.editor.setStyle('height', newHeight - this._ui.editor.getCoordinates().top + app.gui.options.headerHeight);
            }.bind(this),
            'setcontent': function(data) {
                this.setData(data.content);
            }.bind(this)
        });
    },

    initEditor: function(callback) {
        this.initFieldset();

        //this._ui.body = new Element('div', {'class': 'editor-menu-body'});
        this._ui.body = new Element('div', {'class': 'editor-menu-body'});
        this._ui.editor.adopt([
            this._ui.body,
            new Element('div', {'class': 'editor-menu-new'})
                .adopt(new Element('button', {'class': 'btn btn-success btn-lg', 'html': '<span class="glyphicon glyphicon-plus-sign mright-10"></span> Add new element'})
                    .addEvent('click', function() {
                        this.addItem();
                    }.bind(this)))
        ]);

        this.body = this._ui.body; // Shortcut for list elements
        this.reset();

        if (callback != null)
            callback.call(this);
    },
    reset: function() {
        this._items = [];
        this._ui.body.empty();
        this._ui.body.adopt(new Element('div', {'class': 'editor-menu-empty', 'html': 'No elements'}));
    },
    addItem: function(data) {
        if (this._items.length === 0)
            this._ui.body.empty();

        var item = new Backpack.ListEditorItem(this, Object.clone(this._schema.items), data);
        this._ui.body.adopt(item.display());
        this._items.push(item);
    },
    removeItem: function(item) {
        switch (typeOf(item)) {
            case 'object':
                item = this._items.indexOf(item);
                if (item == -1)
                    return;
            case 'number':
                if (this._items[item] == null)
                    return;

                this._items[item]._ui.root.destroy();
                this._items.splice(item, 1);
                break;
        }
    },
    setData: function(data) {
        if (typeOf(data) != 'array')
            return;

        data.each(function(item) {
            this.addItem(item);
        }.bind(this));
    },
    getData: function() {
        var data = this.parent();
        if (!data)
            return;

        data.content = [];

        this._ui.body.getElements('.editor-menu-item').each(function(elem) {
            for (var i = 0 ; i < this._items.length ; i++) {
                if (this._items[i]._ui.root == elem) {
                    data.content.push(this._items[i].getData());
                    return;
                }
            }
        }.bind(this));

        return data;
    }
});

Backpack.ListEditorItem = new Class({
    Extends: gx.ui.Container,

    options: {
        title: ''
    },

    initialize: function (list, options, data) {
        this._list = list;
        this.parent(null, options);

        // Initialize the fieldset
        this.fieldset = new gx.bootstrap.Fieldset(null, {
            horizontal: false
        });
        if (typeOf(this.options.properties) == 'object' && Object.getLength(this.options.properties) > 0) {
            Object.each(this.options.properties, function(property, key) {
                if (property.type != null) {
                    if (property.type.match(/^(collection|bucket):/))
                        property.type = new Backpack.Reference(null, property.type.split(':')[1]);

                    property.label = property.label == null ? key : property.label;
                    this.fieldset.addField(key, property.type, property);
                }
            }.bind(this));
        }

        // Compose the HTML body
        this._ui.root.addClass('editor-menu-item');
        this._ui.body   = new Element('div');
        this._ui.label  = new Element('div', {'html': this.options.title});
        this._ui.form   = new Element('div');
        this._ui.handle = new Element('div', {'class': 'handle'});
        this._ui.remove = new Element('button', {'class': 'btn btn-xs btn-danger right', 'html': '<span class="glyphicon glyphicon-trash"></span>'})
            .addEvent('click', function() {
                this._list.removeItem(this);
            }.bind(this));
        this._ui.dropBefore = new Element('div', {'class': 'droppable droppable-before'});
        this._ui.dropAfter  = new Element('div', {'class': 'droppable droppable-after'});
        this._ui.root.adopt(this._ui.body
            .adopt([
                this._ui.handle,
                this._ui.remove,
                this._ui.dropBefore,
                this._ui.form
                    .adopt([
                        this._ui.label,
                        new Element('div', {'class': 'editor-properties'}).adopt(
                            this.fieldset.display()
                        )
                    ]),
                this._ui.dropAfter
            ])
        );

        // Include drag/drop functionality
        this._ui.handle.addEvent('mousedown', function(event) {
            event.stop();

            this._ui.dropBefore.removeClass('droppable');
            this._ui.dropAfter.removeClass('droppable');
            // this._ui.root.addClass('drag');

            var clone = this._ui.root.clone().inject(this._ui.root, 'before');
            clone.addClass('drag');

            var droppables = this._list.body.getElements('.droppable');
            droppables.addClass('active');

            var drag = new Drag.Move(clone, {
                droppables: droppables,
                container: this._list.body,
                precalculate: true,
                onDrop: function(elem, droppable, event) {
                    if (droppable != null)
                        this._ui.root.inject(droppable.getParent().getParent(), droppable.hasClass('droppable-before') ? 'before' : 'after');
                }.bind(this),
                onEnter: function(elem, droppable){
                    droppable.addClass('highlight');
                }.bind(this),
                onLeave: function(elem, droppable){
                    droppable.removeClass('highlight');
                }.bind(this),
                onComplete: function(elem) {
                    this._ui.dropBefore.addClass('droppable');
                    this._ui.dropAfter.addClass('droppable');
                    this._ui.root.removeClass('drag');
                    this._ui.root.erase('style');
                    droppables.removeClass('active');
                    droppables.removeClass('highlight');
                    clone.destroy();
                }.bind(this)
            });
            drag.start(event);
        }.bind(this));

        this.setData(data);
    },

    getData: function() {
        return this.fieldset.getValues();
    },

    setData: function(data) {
        this.fieldset.setValues(data);
    }
});