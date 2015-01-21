document.addEvent('domready', function() {
    var nav = $("nav");
    window.addEvent('scroll', function() {


        var y = window.getScroll().y;
        if (y < 200) {


            nav.removeClass('openNav');
        } else {
            nav.addClass('openNav');


        }
    });

    new Fx.SmoothScroll({
        duration: 500,
        offset: {
            y: -104
        }
    }, window);
});
