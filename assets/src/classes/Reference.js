/**
 * @class Backpack.Reference
 * @description Creates a dynamic select box, which dynamically loads the contents from a remote URL
 * @extends gx.ui.Container
 * @implements gx.util.Console
 *
 * @param {element|string} display The display element
 *
 */
Backpack.Reference = new Class({
  Extends: gx.ui.Container,

  options: {
    schema: null, // collection schema
    delay: 500, // Search delay
    value: null
  },

  _finder: null,
  _collection: null,
  _schema: null,

  _requester: null,
  _doc: null,
  _delayTimer: null,
  _activeRequest: 0,

  initialize: function(display, collection, options) {
    var root = this;
    try {
      this.parent(display, options);
      this._collection = collection;

      this._display.link = null;
      this._display.textbox = new Element('div', {'class': 'form-control'}).addEvent('click', function(e) {
        if (this._display.button.get('disabled'))
          return;

        if (e.target == this._display.link)
          return;

        this.show();
      }.bind(this));

      this._display.button = new Element('button', {
        'type': 'button',
        'class': 'btn btn-default',
        'html': '<span class="glyphicon glyphicon-folder-open"></span>'
      }).addEvent('click', function() {
        this.show();
      }.bind(this));

      this._display.root.set('class', 'input-group colref-field');
      this._display.root.adopt([
        this._display.textbox,
        new Element('span', {'class': 'input-group-btn'}).adopt(this._display.button)
      ]);
      if (options != null && options.schema != null)
        this._schema = option.schema;

      if (this.options.value != null)
        this.setValue(this.options.value);
      }
    catch (e) {
      gx.util.Console('gx.bootstrap.Select->initialize', gx.util.parseError(e));
    }
  },

  initFinder: function(callback, callbackProperties) {
    if (this.api != null)
      return;

    this.api = new Backpack.Api(this._collection, {
      onReady: function(schema) {
        this._schema = schema;
        this._searchbox = new Element('input', {
          'class': 'form-control',
          'placeholder': 'Search'
        }).addEvent('keydown', function(e) {
          this._delayTimer = (new Date()).getTime();
          (function() {
            if (this._delayTimer <= (new Date()).getTime() - this.options.delay)
              this.search();
            }
          ).delay(this.options.delay, this);
        }.bind(this));
        this._finder = new Backpack.Finder({'header': this._searchbox});
        this._popup = new gx.bootstrap.Popup({
          'width': 600,
          'closable': true,
          'content': __({'class': 'colref-finder', 'child': this._finder}),
          'footer': [
            __({
              'tag': 'button',
              'class': 'btn btn-danger left',
              'html': '<span class="glyphicon glyphicon-trash mright-10"></span>Remove reference',
              'onClick': function() {
                this.setValue(null);
                this._popup.hide();
              }.bind(this)
            }),
            __({
              'tag': 'button',
              'class': 'btn btn-primary',
              'html': '<span class="glyphicon glyphicon-remove mright-10"></span>Close',
              'onClick': function() {
                this._popup.hide();
              }.bind(this)
            })
          ],
          'onOpen': function() {
            this.search();
          }.bind(this)
        });

        if (callback != null)
          callback.call(this, callbackProperties);
        }
      .bind(this)
    });
  },

  search: function() {
    if (this._finder == null)
      return;

    // Stop if there are parallel requests
    this._activeRequest++;
    if (this._activeRequest > 1)
      return;

    this.api.list({
      'search': this._searchbox.get('value'),
      '_deleted': false
    }, null, // No sorting
        function(docs) {
      this._finder.reset();

      docs.each(function(doc) {
        var item = this._finder.addItem(doc.identifier, {
          // 'historyIndex': index,
          'document': doc,
          'schema': this._schema,
          'collection': this._collection,
          'showPublic': this._schema.published == null
            ? null
            : doc.published,
          'onClick': function() {
            this.setValue(doc);
          }.bind(this)
        });
      }.bind(this));

      if (this._activeRequest > 1) {
        this._activeRequest = 0;
        this.search();
      } else {
        this._activeRequest = 0;
      }
    }.bind(this));
  },

  show: function() {
    if (this._finder == null) {
      this.initFinder(this.show);
      return;
    }

    this._popup.show();
  },

  hide: function() {
    if (this._finder == null)
      return;

    this._popup.hide();
  },

  /**
     * @method updateLink
     * @description Update the link component
     * @param {Element} elem New element
     */
  updateLink: function(elem) {
    if (this._display.link != null)
      this._display.link.destroy();

    this._display.link = elem;
    this._display.textbox.adopt(elem);
  },

  /**
     * @method getDoc
     * @description Return the selected document
     */
  getDoc: function() {
    return this._doc;
  },

  /**
     * @method getValue
     * @description Get the document identifier
     */
  getValue: function() {
    return this._doc == null
      ? null
      : this._doc._id;
  },

  /**
     * @method setValue
     * @description Set the reference value
     * @param {null|object|string} value
     */
  setValue: function(value) {
    if (this._finder == null)
      return this.initFinder(this.setValue, value);

    this.hide();

    this._value = null;
    switch (typeOf(value)) {
      case 'null':
        this._doc = null;
        this.updateLink(new Element('i', {'html': 'No reference'}));
        break;
      case 'object':
        this._doc = value;
        this.updateLink(new Element('a', {'html': this._doc.identifier}).addEvent('click', function() {
          app.gui.openEditor(this._doc, this._schema.contenttype, this._collection, {'title': this._doc.identifier});
        }.bind(this)));
        break;
      case 'string':
        if (value === '')
          return;

        this.api.identify(value, function(doc) {
          this.setValue(typeOf(doc) == 'object'
            ? doc
            : null);
        }.bind(this));
        return;
      default:
        throw 'Reference.setValue: Expecting null, string or object';
    }

    this.fireEvent('update', this._value);
  },

  /**
	 * @method reset
	 * @description Resets the selection
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
  reset: function() {
    this._finder.reset();
    this._value = null;

    this.fireEvent('update', this._value);
  },

  /**
	 * @method enable
	 * @description Enables the text box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
  enable: function() {
    this._display.button.erase('disabled');
    return this;
  },

  /**
	 * @method disable
	 * @description Disables the text box
	 * @returns Returns this instance (for method chaining).
	 * @type gx.bootstrap.Select
	 */
  disable: function() {
    this._display.button.set('disabled', true);
    return this;
  }
});
