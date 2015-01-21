/**
 * @class Backpack.GUI
 * @description Creates the GUI
 * @implements Options
 * @implements Events
 *
 * @author Peter-Christoph Haider <peter.haider@zeyos.com>
 * @version 1.00
 * @package Backpack
 * @copyright Copyright (c) 2014, Zeyon GmbH & Co. KG
 *
 * @param {object} options
 */
Backpack.Gui = new Class({
	Extends: gx.core.Settings,
	options: {
		'headerHeight': 35, // reflecting css property
		'tabmenuHeight': 30, // reflecting css property
		'username': 'Testname',
		'minContentWidth': 770 // change sliders to automatic mode if content width is less than this
	},

	_tabs: [],
	_editors: {},
	_activeTab: null,
	_ui: {},
	menu: {},
	timer: null,
	_height: 100,

	initialize: function(options) {
		var root = this;

		this._msg = new gx.bootstrap.Message(null, {margintop: '20px'});

		this.setOptions(options);

        // Initialize the general layout
		this._ui.root     = new Element('div', {'id': 'gui'});
		this._ui.content  = new Element('div', {'id': 'content'});
		this._ui.userinfo = new Element('div', {'id': 'userinfo'});
		this._ui.tabmenu  = new Element('div', {'id': 'tabmenu'});
		this._ui.header = __({
			'id': 'header', 'children': [
                {'tag': 'a', 'href': 'https://github.com/zeyon/backpack', 'target': '_blank', 'html': '<span id="logo"></span><span>Backpack</span>'},
                this._ui.userinfo
			]
		});

        // Initalize the spliiter
        this._ui.table = new Element('table', {'id': 'splitter'});
        this._ui.row   = new Element('tr');
        this._ui.left  = new Element('td');
        this._ui.right = new Element('td');
        this._ui.table.adopt(
            this._ui.row.adopt([
                this._ui.left,
                this._ui.right
            ])
        );

        this._ui.root.adopt([this._ui.header, this._ui.table]);
        this._ui.right.adopt([this._ui.tabmenu, this._ui.content]);

		// Initialize the loader components
		this.colors = ['#009ee0', '#99d8f3', '#0f6b93'];
		this.duration = 250;
		this._ui.topLoader = __({'id': 'toploader', 'styles': {'display': 'none'}, 'children': [
			{'tag': 'span'},
			{'tag': 'span'},
			{'tag': 'span'},
			{'tag': 'span'}
		]}).inject(this._ui.header);
		this.topLoader = {
			tweens: [],
			step: 0
		};
		this._ui.topLoader.getElements('span').each(function(block) {
			this.topLoader.tweens.push(new Fx.Tween(block, {
				'duration': 500,
				'transition': 'Sine:out'
			}));
		}.bind(this));
		this.topLoader.animator = function() {
			this.topLoader.tweens.each(function(tween, index) {
				(function() {
					tween.start('background-color', this.colors[this.topLoader.step]);
				}).delay((index + 1) * this.duration, this);
			}.bind(this));
			this.topLoader.step = this.topLoader.step == 2 ? 0 : this.topLoader.step + 1;
		}.bind(this);

        // init Backpack.Menu inside left slider tab
        this.menu = new Backpack.Menu(this._ui.left);

        // Dispatch events for resizing
        this.addEvents({
            'updateheight': function(newHeight) {
                this._ui.left.setStyle('height', newHeight);
            }.bind(this)
        });
        window.addEvent('resize', function() {
            this.updateHeight();
        }.bind(this));

        this.updateHeight();

        // Initialize the resizer
        this._ui.resizer = new Element('div', {'id': 'resizer'}).inject(this._ui.left, 'top');
        this.drag = new Drag(this._ui.resizer, {
            snap: 0,
            style: false,
            onDrag: function(el, e) {
                this.menu.setWidth(e.client.x);
            }.bind(this),
            onBeforeStart: function() {
                if (this._activeTab != null && this._activeTab.editor != null && this._activeTab.editor._ui.ckiframe != null)
                    this._activeTab.editor._ui.ckiframe.setStyle('display', 'none');
            }.bind(this),
            onComplete: function() {
                if (this._activeTab != null && this._activeTab.editor != null) {
                    if (this._activeTab.editor._ui.ckiframe != null)
                        this._activeTab.editor._ui.ckiframe.setStyle('display', 'block');
                    this.updateHeight();
                }

            }.bind(this)
        });
	},

    inject: function() {
        this._ui.root.inject($(document.body));
    },

	updateHeight: function(noPropagation) {
		this._height = window.getSize().y - this.options.headerHeight;
		if (noPropagation == null)
			this.fireEvent('updateheight', this._height)

		return this._height;
	},

	showUserInfo: function(auth) {
		/*
		if (this._ui.mnuLogout != null) {
			this._ui.mnuLogout.set('html', btnText);
			return;
		}
		*/

		if (auth.username == 'root') {
			this._ui.mnuSetup = new Element('a', {'class': 'btn btn-primary btn-xs mleft-10', 'html': '<span class="glyphicon glyphicon-wrench"></span> Setup'});
			this._ui.userinfo.adopt(this._ui.mnuSetup);
			this._ui.mnuSetup.addEvent('click', function() {
				this.fireEvent('setup');
			}.bind(this));
		}

		this._ui.mnuLogout = new Element('a', {'class': 'btn btn-default btn-xs mleft-10', 'html': '<span class="glyphicon glyphicon-log-out"></span> Logout <b>' + auth.username + '</b>'});
		this._ui.userinfo.adopt(this._ui.mnuLogout);
		this._ui.mnuLogout.addEvent('click', function() {
			this.fireEvent('logout');
		}.bind(this));
	},

	hideUserInfo: function() {
		this._ui.userinfo.empty();
	},

	/**
	 * @method setContent
	 * @description Sets/resets the current content
	 * @param {node} elem The element with the content
	 */
	setContent: function(elem) {
		if (this._ui.current != null)
			this._ui.current.dispose();
		if (elem != null) {
			this._ui.current = elem;
			this._ui.content.adopt(this._ui.current);
		} else
			this._ui.current = null;
	},

	showLoader: function() {
		// this.hideMsg();
		this._ui.topLoader.setStyle('display', 'block');
		this.topLoader.animator();
		this.topLoader.timer = this.topLoader.animator.periodical((1+this.topLoader.tweens.length) * this.duration, this);
	},

	hideLoader: function() {
		if (this.topLoader.timer != null) {
			this._ui.topLoader.setStyle('display', 'none');
			clearInterval(this.topLoader.timer);
		}
	},

	showMessage: function(msg, iconClass, closable, blend, autoclose) {
        var glyphicon = 'ban-circle';
		switch (iconClass == null ? 'danger' : iconClass) {
            case 'warning':
                glyphicon = 'warning-sign';
                break;
            case 'info':
                glyphicon = 'flag';
                break;
            case 'success':
                glyphicon = 'ok-circle';
                break;
            default:
                iconClass = 'danger';
                break;
        }
		this._msg.addMessage('<span class="mright-10 glyphicon glyphicon-' + glyphicon + '"></span>' + msg, iconClass, closable, blend, autoclose);
	},

	addFileEditor: function(file, options) {
		console.log('file', file);
		if (file.filename == null)
			throw 'Filename not specified!';

		if (this._editors[file.filename] == null)
			this._editors[file.filename] = new Backpack.FileEditor(this, file, options);

		this._ui.content.adopt(this._editors[file.filename].display());
		this._editors[file.filename].open();

		return this._editors[file.filename];
	},

	getEditorByDocId: function(docid) {
		for (var i in this._editors) {
			if (this._editors[i]._docid != null && this._editors[i]._docid == docid) {
				this._editors[i].open();
				return this._editors[i];
			}
		}

		return false;
	},

    openEditor: function(doc, contenttype, collection, options) {
        var docId = null;
        if (doc != null && doc._id != null) {
            var editor = this.getEditorByDocId(doc._id);
            if (editor) {
                editor.open();
                return editor;
            }
            docId = doc._id;
        }

        return this.addEditor(
            this.getEditorClass(contenttype),
            collection,
            docId,
            Object.merge(options == null ? {} : options, {
                'onEditorready': function () {
                    this.open();
                }
            })
        );
    },

	addEditor: function(editorClass, collection, docid, options) {
		var key = collection + '-' + (docid == null ? (options.identifier ? options.identifier : new Date()) : docid);

		if (options.historyIndex != null)
			key += options.historyIndex;

		if (this._editors[key] == null)
			this._editors[key] = new editorClass(this, collection, docid, options);

		this._ui.content.adopt(this._editors[key].display());
		this._editors[key].open();

		return this._editors[key];
	},

	addDocumentEditor: function(collection, docid, options) {
		return this.addEditor(Backpack.DocumentEditor, collection, docid, options);
	},

	addFileUploadEditor: function(bucket, docid, options) {
		return this.addEditor(Backpack.FileUploadEditor, bucket, docid, options);
	},

	addListEditor: function(collection, docid, options) {
		return this.addEditor(Backpack.ListEditor, collection, docid, options);
	},

	getEditorClass: function(contenttype) {
        if (typeof contenttype !== 'undefined') {
            if (contenttype.indexOf('file') === 0)
                return Backpack.FileUploadEditor;
            if (contenttype === 'list')
                return Backpack.ListEditor;
        }

		return Backpack.DocumentEditor;
	},

	addTab: function(label, onOpen, onClose, editor, iconClass) {
		var tab = {};

		tab.icon = new Element('span', {'class': 'glyphicon glyphicon-'+iconClass});

		tab.closer = new Element('b');
		tab.label = new Element('span', {'html': label});
		tab.frame = __({'tag': 'a', 'children': [tab.icon, tab.label, tab.closer]});

		tab.onOpen = onOpen;
		tab.open = function() {
			if (this._activeTab != null && this._activeTab != tab) {
				if (this._activeTab.onBlur != null)
					if ( this._activeTab.onBlur() === true ) // stop event to prevent loosing focus
						return;

			}

			if (tab.onOpen != null)
				tab.onOpen();

			if (this._activeTab != null && this._activeTab != tab) {
				this._activeTab.frame.removeClass('active');
				this._activeTab.editor.fireEvent('hide');

			}
			this._activeTab = tab;
			tab.frame.addClass('active');
			editor.fireEvent('show');

			this.fireEvent('opentab', tab);
		}.bind(this);

		tab.onClose = onClose;
		tab.close = function() {
			if (tab.onClose != null)
				if (tab.onClose() === true) // Stop the event (e.g. if the file should be saved first)
					return;

            // Close the active editor
            var isOpen = this._activeTab == tab;
			if (isOpen) {
				this._activeTab = null;
				editor._ui.root.destroy();
			}
			if (editor) {
				var key = Object.keyOf(this._editors, editor);
				if (key)
					delete this._editors[key];
			}

            var index = this._tabs.indexOf(tab);

            // Remove the tab
			tab.frame.destroy();
			this._tabs.erase(tab);
			this.fireEvent('closetab', tab);

            // Open the next remaining tab
            if (!isOpen || this._tabs.length === 0)
                return;

            if (index > this._tabs.length - 1)
                index = this._tabs.length - 1;

            this._tabs[index].open();
		}.bind(this);

		tab.frame.addEvent('click', function() {
			tab.open();
		}.bind(this));
		tab.closer.addEvent('click', function() {
			tab.close();
		}.bind(this));

		tab.editor = editor;

		this._tabs.push(tab);
		this._ui.tabmenu.adopt(tab.frame);

		return tab;
	},

	toElement: function() {
		return this._ui.root;
	}
});
