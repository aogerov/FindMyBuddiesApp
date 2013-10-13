(function (global) {
    function getJSON(url) {
        var promise = new RSVP.Promise(function (resolve, reject) {
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                timeout: 10000,
                success: function (data) {
                    resolve(data);
                },
                error: function (err) {
                    reject(err);
                }
            });
        });
        return promise;
    }

    function postJSON(url, data) {
        var promise = new RSVP.Promise(function (resolve, reject) {
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                timeout: 10000,
                data: JSON.stringify(data),
                success: function (data) {
                    resolve(data);
                },
                error: function (err) {
                    reject(err);
                }
            });
        });
        return promise;
    }

    function putJSON(url, data) {
        var promise = new RSVP.Promise(function (resolve, reject) {
            $.ajax({
                url: url,
                type: "PUT",
                dataType: "json",
                contentType: "application/json",
                timeout: 10000,
                data: JSON.stringify(data),
                success: function (data) {
                    resolve(data);
                },
                error: function (err) {
                    reject(err);
                }
            });
        });
        return promise;
    }

    global.httpRequester = {
        getJSON: getJSON,
        postJSON: postJSON,
        putJSON: putJSON
    };
})(window);
