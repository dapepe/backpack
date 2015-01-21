/**
 * @class Backpack.Finder
 * @description Creates the menu
 * @extends gx.ui.Container
 *
 * @author Peter-Christoph Haider <peter.haider@zeyos.com>
 * @version 1.00
 * @package Backpack
 * @copyright Copyright (c) 2014, Zeyon GmbH & Co. KG
 *
 * @param {string|node} display
 * @param {object} options
 *
 * @option {string} className The name of the menu class
 * @option {function} renderEntry Renders the menu entry
 */
Backpack.Finder = new Class({
	Extends: gx.ui.Container,

	options: {
		'pointer' : true,
		'positioning': 'fixed',
		'parent': null,
		'offset': 55,
		'search': false // Will fire an onSearch-Event, when someone is searching
	},

    _items: [],
	_open: false,
	_acc: false,
	_request: false,

	initialize: function(options) {
		var root = this;

		this.parent(new Element('div', {
			'class': 'finder'
		}), options);

		this._ui.loader = new Element('div', {
			'class': 'finder-loader',
			'styles': {
				'margin-left': this.options.width / 2,
				'margin-top': 50
			}
		});

		this._ui.header  = new Element('div', {'class': 'finder-header', 'styles': {'height': this.options.headerHeight}});
		this._ui.body    = new Element('div', {'class': 'finder-body'});

		this._ui.root.adopt([
			this._ui.loader,
			this._ui.btnClose,
			this._ui.pointer,
			this._ui.header,
			this._ui.body,
			new Element('div.clear')
		]);

        if (this.options.header != null)
            this.setHeader(this.options.header);
	},

	reset: function() {
		if (this._request)
			this._request.cancel();

        this._ui.body.empty();
	},

	setHeader: function(elem) {
		this._ui.header.empty();
		this._ui.header.adopt(elem, new Element('div.clear'));
		this._ui.header.setStyle('display', 'block');
	},

	showLoader: function() {
		this._ui.loader.show();
	},

	hideLoader: function() {
		this._ui.loader.hide();
	},

    addItem: function(finderItem, options) {
        if (!(finderItem instanceof Backpack.FinderItem))
            finderItem = new Backpack.FinderItem(finderItem, options);
        this._items.push(finderItem);
        this._ui.body.adopt(finderItem.display());
        return finderItem;
    },

    addThumbnail: function(finderItem, options) {
        if (!(finderItem instanceof Backpack.FinderThumbnail))
            finderItem = new Backpack.FinderThumbnail(finderItem, options);

        this._items.push(finderItem);
        this._ui.body.adopt(finderItem.display());
        return finderItem;
    }
});

Backpack.FinderItem = new Class({
	Extends: gx.ui.Container,
	options: {
		historyIndex: false,
        showPublic: null
	},
	_items: [],
	_menu: null,
	initialize: function(label, options) {
		this.parent(new Element('a', {'class': 'finder-item'}), options);
		this._ui.root.addEvent('click', function() {
			this.fireEvent('click');
		}.bind(this));

		this._ui.top        = new Element('div');
		this._ui.text       = new Element('div', {'class': 'text'});
		this._ui.metaplace  = new Element('div', {'class': 'meta metaplace'});
		this._ui.meta       = new Element('div', {'class': 'meta'});
		this._ui.label      = new Element('b', {
			'html': label
		});

        if (this.options.showPublic !== null) {
            this._ui.root.adopt(new Element('i', {
                'class': 'hint--left ' + (this.options.showPublic ? 'public': 'draft'),
                'data-hint': this.options.showPublic ? 'Published': 'Draft'
            }));
        }

		this._ui.root.adopt([
			this._ui.top,
			this._ui.text,
			this._ui.metaplace, // this is a hidden equal div just to take the place of the meta text
			// in case of the text is so long so that he would overlap the meta text (cause of absolute positioning
			// of the original meta div)
			this._ui.meta,
			new Element('div.clear')
		]);

		this._ui.top.adopt([
			this._ui.label
		]);

		if ( this.options.buttons )
			this._ui.top.adopt(this.options.buttons);

		var document = this.options.document;

		if ( this.options.schema.contenttype.indexOf('file') === 0 ) {
			var s = this.options.schema.contenttype.split(':');
			if ( s.length > 1 ) {
				var ct = s[1];
				if ( ct.indexOf('image') === 0 ) {
					var bucket = this.options.collection;
					var id = document._id;
					if ( this.options.historyIndex !== false ) {
						bucket += '.history';
						id = document._historyid;
					}
					new Element('div', {
						'class': 'left thumb img-polaroid',
						'styles': {
							'background-image': 'url("./index.php?api=gridfs&do=preview_file&bucket=' + bucket + '&index=' + id + '&size=80")'
						}
					}).inject(this._ui.root, 'top');
				}
			}
		}

        // Include a thumbnail
		if (typeOf(this.options.schema.listfields) == 'array') {
            this.options.schema.listfields.each(function(id) {
				var field = this.options.schema.properties[id];
                if (field == null)
                    return;

				var value = document[id];
				if ( field.type == 'select' && field.options[value] != null )
					value = field.options[value];

                if (typeof value == 'string' && value !== '')
				    this._ui.text.adopt(new Element('span', {'html': (field.label != null ? field.label : id) + ': ' + value }));
            }.bind(this));
		}
	},

	getButtonBar: function() {
		return this._ui.top;
	}
});

Backpack.FinderThumbnail = new Class({
	Extends: gx.ui.Container,
	options: {
		width:  115,
		height: 115
	},
	initialize: function(label, options) {
		this.parent(new Element('a', {
			'class' : 'finder-thumbnail'
		}), options);

		this._ui.root.addEvent('click', function() {
			this.fireEvent('click');
		}.bind(this));

		this._ui.label = new Element('p', {
			'html': label,
			'title': label
		});
		this._ui.bg = new Element('div');

		this._ui.root.setStyles({
			'width' : this.options.width,
			'height': this.options.height + 40
		});

		this._ui.bg.setStyles({
			'width' : 'inherit',
			'height': this.options.height
		});

		if ( this.options.file.isPicture ) {
			this._ui.thumb = new Element('div', {
				'styles': {
					'height': this.options.height,
					'width' : this.options.width,
					'background': 'transparent url("index.php?api=file&do=thumbnail&file=' + encodeURI(this.options.file.path) + '") no-repeat center'
				}
			});
		} else {
			this._ui.thumb = new Element('i');
			if ( options.file != null ) {
				this._ui.thumb.addClass('file file-' + ( options.file.is_dir ? 'dir' : options.file.extension) );
			}
		}

		this._ui.root.adopt([this._ui.bg.adopt(this._ui.thumb), this._ui.label]);
	}
});