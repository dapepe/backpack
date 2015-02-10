function removeClass(elem, cName) {
    elem.className = elem.className.replace(new RegExp('[\s]?' + cName), '');
}
function addClass(elem, cName) {
    if (elem.className.match(new RegExp(cName)))
        return;

    elem.className += elem.className ? (' ' + cName) : cName;
}

function openPopupSubscribe() {
    var popupSubscribe = document.getElementById('popupSubscribe');
    popupSubscribe.style.display = 'block';
    setTimeout(function() {
        addClass(popupSubscribe, 'in');
    }, 500);
}
function closePopupSubscribe() {
    var popupSubscribe = document.getElementById('popupSubscribe');
    removeClass(popupSubscribe, 'in');
    setTimeout(function() {
        popupSubscribe.style.display = 'none';
    }, 500);
}