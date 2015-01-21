/**
 * File picker for CKEdit
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2015, Zeyon Technologies
 */
window.addEvent('view-ckselector', function() {
	app.gui = new Backpack.Gui();

	UserApi.session(function(res) {
		if (res) {
			app.session = res;
			window.fireEvent('authready');
		} else {
			app.gui.showMessage('You must be logged in for this view.');
		}
	});

    window.addEvent('authready', function() {
        var body       = new Element('div').inject($(document.body)),
            menu       = new Backpack.Menu(body),
            bucketList = menu.addMenuFrame('Buckets'),
            baseUrl    = $(document.body).get('data-url');

        // Get the CKEditor Function Number
        function getUrlParam(paramName) {
            var reParam = new RegExp('(?:[\?&]|&amp;)' + paramName + '=([^&]+)', 'i') ;
            var match = window.location.search.match(reParam) ;

            return (match && match.length > 1) ? match[1] : '';
        }
        CKEditorFuncNum = getUrlParam('CKEditorFuncNum');

        if (baseUrl == null || baseUrl === '')
            baseUrl = './';

        CollectionApi.listCollections(function(list) {
            Object.each(list, function(schema, collection) {
                if (!schema.contenttype.match(/^file:image/))
                    return;

                var name = ucfirst(collection);
                if (schema.label != null && schema.label.plural != null)
                    name = schema.label.plural;

                var menuItem =  bucketList.addMenuItem(name, {
                    'iconClass': schema.icon == null ? 'chevron-right' : schema.icon,
                    'helptext' : schema.helptext
                });

                menuItem.addEvent('click', function() {
                    var section = {};
                    section.api = new Backpack.Api(collection, {
                        onReady: function(schema) {
                            var fileList = menu.addMenuFrame(name);

                            section.finder = fileList.addFinder();

                            section.filter = {
                                'search': new Element('input', {'class': 'form-control', 'placeholder': 'Search'})
                                    .addEvent('keydown', function (e) {
                                        if (e.key == 'enter')
                                            section.load();
                                    })
                            };

                            section.finder.setHeader(__({
                                'class': 'finder-filter',
                                'child': section.filter.search
                            }));

                            // Setup the requester
                            section.load = function () {
                                section.api.list(
                                    {
                                        'search': section.filter.search.get('value')
                                    },
                                    null, // No sorting
                                    function (docs) {
                                        section.finder.reset();
                                        docs.each(function (doc) {
                                            var item = section.finder.addItem(doc.identifier, {
                                                'document'  : doc,
                                                'schema'    : schema,
                                                'collection': collection,
                                                'showPublic': schema.published == null ? null : doc.published,
                                                'onClick'   : function () {
                                                    window.opener.CKEDITOR.tools.callFunction(CKEditorFuncNum, baseUrl + 'grid/' + collection + '/' + doc.identifier);
                                                    window.close();
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