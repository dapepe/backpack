/**
 * @class Backpack.Menu
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
Backpack.Menu = new Class({
	Extends: gx.ui.Container,

	options: {
		'width': 250,
		'username': false,
        'headerHeight': 61 // reflecting css property
	},
	_menuFrames: [],

	initialize: function (parent, options) {
		var root = this;

		this.parent(new Element('div', {'id': 'menu'}), options);
		this._ui.root.inject(parent);

		this.setWidth(this.options.width);

        this._ui.bar       = Element('div', {'id': 'menu-bar'}).inject(this._ui.root);
		this._ui.btnGroup  = new Element('div', {'class': 'btn-group', 'styles': {'opacity': 0}});
		this._ui.btnBack   = new Element('button', {'class': 'btn btn-xs btn-default', 'html': 'History'});
        this._ui.btnToggle = new Element('button', {'class': 'btn btn-xs btn-default dropdown-toggle', 'html': '<span class="caret"></span>'});
		this._ui.btnMenu   = new Element('ul', {'class': 'dropdown-menu'});
		this._ui.btnGroup.adopt([this._ui.btnBack, this._ui.btnToggle, this._ui.btnMenu]);

        this._ui.btnNew = new Element('button', {'class': 'btn btn-xs btn-primary mtop-10 mright-10 right', 'styles': {'opacity': 0}, 'html': '<span class="glyphicon glyphicon-plus"></span>'});
        this._ui.btnNew.addEvent('click', function () {
            this.currentFrame().fireEvent('new');
        }.bind(this));
        this._ui.bar.adopt([this._ui.btnGroup, this._ui.btnNew, new Element('div', {'class': 'clear'})]);

		this._ui.btnBack.addEvent('click', function() {
			this.navigateBack();
		}.bind(this));
		this._ui.btnToggle.addEvent('click', function() {
			this._ui.btnGroup.toggleClass('open');
		}.bind(this));
		$(document.body).addEvent('click', function(event) {
			if (event.target != this._ui.btnToggle && this._ui.btnToggle.firstChild)
				this._ui.btnGroup.removeClass('open');
		}.bind(this));

		this._ui.frame = new Element('div', {'id': 'menu-body'}).inject(this._ui.root);
	},

    setWidth: function(width) {
        this._ui.root.setStyle('width', width);
    },

	setHeight: function(height) {
        console.log('Menu.setHeight', height);
        return;
		this._ui.root.setStyle('height', height + 'px');
        this._innerHeight = height - this.options.headerHeight;
        this._menuFrames.each(function(frame) {
            frame.setHeight(this._innerHeight);
        }.bind(this));
	},

	navigateBack: function() {
		var k = this._menuFrames.length - 2;
		if (k >= 0)
			this.navigateTo(this._menuFrames[k]);
	},

	navigateTo: function(frame) {
		var index = this._menuFrames.indexOf(frame);
		if (index == -1)
			return;

		var delta = this._menuFrames.length - index;
		var rmvFrame;

		while(delta > 1) {
			rmvFrame = this._menuFrames.pop();
			rmvFrame._historyLink.destroy();
			rmvFrame._ui.root.destroy();
            delete rmvFrame;
			delta--;
		}

        this.updateFramePos();

        this.showNewBtn(frame.showNew());

		this.updateHistory();
	},

	updateHistory: function() {
		if (this._menuFrames.length > 1) {
            this._ui.btnGroup.fade('in');
			this._menuFrames.getLast()._name
			this._ui.btnBack.set('html', this._menuFrames.getLast()._label);
		} else {
            this._ui.btnGroup.fade('out');
		}
	},

    showNewBtn: function(show) {
        this._ui.btnNew.fade(show ? 'in' : 'out');
    },

	addMenuFrame: function(menuFrame, options) {
		if (!(menuFrame instanceof Backpack.MenuFrame))
			menuFrame = new Backpack.MenuFrame(menuFrame, options);
		else if (this._menuFrames.contains(menuFrame))
			return;

		var width = this._ui.root.getSize().x;
		this._menuFrames.push(menuFrame);

        this.updateFramePos();

		menuFrame._historyLink = new Element('li').adopt(new Element('a', {'html': menuFrame._label}).addEvent('click', function() {
			this.navigateTo(menuFrame);
		}.bind(this)));
		this._ui.btnMenu.adopt(menuFrame._historyLink);

		this.updateHistory();

		// this._ui.frame.setStyle('width', this._menuFrames.length * width);
		this._ui.frame.adopt(menuFrame.display());

        this.showNewBtn(menuFrame.showNew());

		return menuFrame;
	},

    updateFramePos: function() {
        var p = 100 / this._menuFrames.length;
        for ( var i = 0; i < this._menuFrames.length; i++ ) {
            this._menuFrames[i].setStyle('width', p + '%');
        }
        this._ui.frame.setStyle('margin-left', this._menuFrames.length <= 1 ? 0 : ((this._menuFrames.length - 1) * -100) + '%');
    },

	currentFrame: function() {
		return this._menuFrames.getLast();
	}
});

Backpack.MenuFrame = new Class({
	Extends: gx.ui.Container,
	options: {},
	_historyLink: null,
	_menuItems: [],
	_menuGroups: [],
	_menu: null,
    _finder: [],

	initialize: function(label, options) {
		this._label = label;
		this.parent(new Element('div', {'class': 'menuFrame'}), options);
	},

	addMenuItem: function(menuItem, options) {
		if (!(menuItem instanceof Backpack.MenuItem))
			menuItem = new Backpack.MenuItem(menuItem, options);
		this._menuItems.push(menuItem);
		this._ui.root.adopt(menuItem.display());
		return menuItem;
	},

	addMenuGroup: function(menuGroup, options) {
		if (!(menuGroup instanceof Backpack.MenuGroup))
			menuGroup = new Backpack.MenuGroup(menuGroup, options);
		this._menuGroups.push(menuGroup);
		this._ui.root.adopt(menuGroup.display());
		return menuGroup;
	},

    addFinder: function(finder, options) {
        if (!(finder instanceof Backpack.Finder))
            finder = new Backpack.Finder(finder, options);

        this._ui.root.adopt(finder.display());
        this._finder.push(finder);
        // finder.setHeight(this._height);
        return finder;
    },

    removeFinder: function(finder) {
        var index = this._finder.indexOf(finder);
        if (index == -1)
            return;

        this._finder[index]._ui.root.destroy();
        delete this._finder[index];
    },

    showNew: function() {
        return typeof this.options.onNew == 'function';
    }
});

Backpack.MenuGroup = new Class({
	Extends: gx.ui.Container,
	options: {
		open: true
	},
	_menuItems: [],
	initialize: function(label, options) {
		this.parent(new Element('div', {'class': 'menuGroup'}), options);
		this._ui.header = new Element('a', {'html': label});
		this._ui.body = new Element('div');
		this._ui.header.addEvent('click', function() {
			this._ui.root.toggleClass('active');
		}.bind(this));
		this._ui.root.adopt([this._ui.header, this._ui.body]);

		if (!this.options.open)
			this._ui.root.addClass('active');
	},

	reset: function() {
		this._menuItems = [];
		this._ui.body.empty();
	},

	addMenuItem: function(menuItem, options) {
		if (!(menuItem instanceof Backpack.MenuItem))
			menuItem = new Backpack.MenuItem(menuItem, options);
		this._menuItems.push(menuItem);
		this._ui.body.adopt(menuItem.display());
		return menuItem;
	}
});

Backpack.MenuItem = new Class({
	Extends: gx.ui.Container,
	initialize: function(label, options) {
		this.parent(new Element('a', {'html': label, 'class': 'menuItem'}), options);
		this._ui.icon = new Element('span', {'class': 'glyphicon'}).inject(this._ui.root, 'top');
		this._ui.root.addEvent('click', function() {
			this.fireEvent('click');
		}.bind(this));
		if (typeof this.options.iconClass != 'undefined')
			this._ui.icon.addClass('glyphicon-' + this.options.iconClass);
	}
});
