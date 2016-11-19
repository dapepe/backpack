/**
 * Backpack Management Console
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2015, Zeyon Technologies
 */
window.addEvent('view-console', function() {
	app.gui = new Backpack.Gui({
		'onLogout': function() {
			UserApi.logout(function() {
				app.gui.setContent();
				app.gui.hideUserInfo();
				app.gui.showLoader();
				window.location.reload();
			});
		},
        'onSetup': function() {
            app.setupDialog.show();
        }
	});

	app.loginDialog = new Backpack.LoginDialog({
		'onLogin': function() {
			UserApi.login({
				'username': this.txtUsername.getValue(),
				'password': this.txtPassword.getValue(),
				'cookie'  : this.cbxRemember.get() ? 1 : 0,
				'session' : 1
			}, function(res) {
				if (res) {
					app.loginDialog.hide();
					app.session = res;
					app.gui.showUserInfo(res);
					window.fireEvent('authready');
				} else {
					app.gui.showMessage('Invalid username or password');
				}
			});
		}
	});

    app.setupDialog = new Backpack.SetupDialog();

	UserApi.session(function(res) {
		if (res) {
			app.session = res;
			app.gui.showUserInfo(res);
			window.fireEvent('authready');
		} else {
			app.loginDialog.show();
		}
	});


    window.addEvent('authready', function() {
        app.gui.inject();

        var menuFrame = app.gui.menu.addMenuFrame('Home');

        CollectionApi.listCollections(function(list) {
            Object.each(list, function(schema, collection) {
                var name = ucfirst(collection);
                if (schema.label != null && schema.label.plural != null)
                    name = schema.label.plural;

                var menuItem =  menuFrame.addMenuItem(name, {
                    'iconClass': schema.icon == null ? 'chevron-right' : schema.icon,
                    'helptext' : schema.helptext
                });

                menuItem.addEvent('click', function() {
                    var section = {};
                    section.api = new Backpack.Api(collection, {
                        onReady: function(schema) {
                            // Add the menu frame
                            var frame = app.gui.menu.addMenuFrame(name, {
                                'onNew': function () {
                                    app.gui.openEditor(null, schema.contenttype, collection, {
                                        'title': Backpack.EditorTitle.get(collection, schema),
                                        'onRemove': function () {
                                            section.load();
                                        },
                                        'onSave': function () {
                                            section.load();
                                        }
                                    });
                                }
                            });

                            // Add the finder
                            section.finder = frame.addFinder();

                            // Initialize the filter bar
                            section.filter = {
                                'search': new Element('input', {'class': 'form-control', 'placeholder': 'Search'})
                                    .addEvent('keydown', function (e) {
                                        if (e.key == 'enter') {
                                            section.load(section.finder, collection, schema);
																				}
                                    }),
                                'delButton': new Element('button', {
                                    'class': 'btn btn-default hint--left',
                                    'data-hint': 'Show deleleted'
                                })
                                    .adopt([
                                        new Element('span', {'class': 'glyphicon glyphicon-eye-close'}),
                                        new Element('span', {'class': 'glyphicon glyphicon-eye-open'})
                                    ])
                                    .addEvent('click', function () {
                                        this.toggleClass('btn-warning');
                                        section.load();
                                    })
                            };
                            section.finder.setHeader(__({
                                'class': 'finder-filter', 'children': [
                                    {'child': section.filter.search},
                                    section.filter.delButton
                                ]
                            }));

                            // Setup the requester
                            section.load = function () {
                                section.api.list(
                                    {
                                        '_deleted': section.filter.delButton.hasClass('btn-warning'),
                                        'search'  : section.filter.search.get('value')
                                    },
                                    null, // No sorting
                                    function (docs) {
                                        section.finder.reset();
                                        docs.each(function (doc) {
                                            var item = section.finder.addItem(doc.identifier, {
                                                // 'historyIndex': index,
                                                'document'  : doc,
                                                'schema'    : schema,
                                                'collection': collection,
                                                'showPublic': schema.published == null ? null : doc.published,
                                                'onClick'   : function () {
                                                    app.gui.openEditor(doc, schema.contenttype, collection, {
                                                        'title': doc.identifier,
                                                        'onRemove': function () {
                                                            section.load();
                                                        },
                                                        'onRestore': function () {
                                                            section.load();
                                                        },
                                                        'onSave': function () {
                                                            section.load();
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                );
                            };
                            section.load();
                        }
                    });
                });
            });
        });
    });
});
