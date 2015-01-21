var app = {
    request: function(data, onSuccess, onFailure) {
        var req = new Request({
            'url': './index.php',
            'method': 'POST',
            'data': data,
            'onStart': function() {
                app.gui.showLoader();
            },
            'onComplete': function() {
                app.gui.hideLoader();
            },
            'onFailure': function() {
                app.gui.hideLoader();
                if (onFailure != null)
                    onFailure();
            },
            'onSuccess': function(json) {
                var res = JSON.decode(json);
                var t = typeOf(res);
                if (t == 'object') {
                    if (res.error != null) {
                        app.gui.showMessage(res.error, 'danger');
                    } else {
                        if (onSuccess != null)
                            onSuccess(res.result);
                    }
                } else {
                    app.gui.showMessage('Invalid server response! Server returned "' + t + '", Object expected!', 'error');
                }
            }
        });

        req.send();

        return req;
    }
};

window.fireEvent('appready');
window.fireEvent('view-' + $(document.body).get('data-view'));