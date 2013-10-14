(function (global) {
    var mobileSkin = "";
    var app = global.app = global.app || {};

    document.addEventListener("deviceready", function () {
        app.application = new kendo.mobile.Application(document.body, { transition: "slide", layout: "tabstrip-layout" });
        app.servicesBaseUrl = 'http://wherearemybuddiesapi.apphb.com/api/';
        //app.servicesBaseUrl = 'http://localhost:34585/api/';
        document.addEventListener("offline", onOffline, false);
    }, false);

    app.changeSkin = function (e) {
        if (e.sender.element.text() === "Flat") {
            e.sender.element.text("Native");
            mobileSkin = "flat";
        }
        else {
            e.sender.element.text("Flat");
            mobileSkin = "";
        }

        app.application.skin(mobileSkin);
    };
    
    function onOffline() {
        navigator.notification.vibrate(2000);
        navigator.notification.alert("You need a connection to use this app.", function() {
            navigator.app.exitApp();
        }, "No connection", "Exit");
    }
})(window);