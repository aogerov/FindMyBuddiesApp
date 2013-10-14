(function(global) {  
    var map;
    var geocoder;
    var MapViewModel;
    var app = global.app = global.app || {};

    MapViewModel = kendo.data.ObservableObject.extend({
        myMarker: null,
        buddieMarkers: [],
        isLoading: false,
        buddieNickname: "",
        address: "",

        onNavigateHome: function () {
            var that = this;
            var position;

            that.isLoading = true;
            that.showLoading();

            navigator.geolocation.getCurrentPosition(
                function (newPosition) {
                    var coordinates = {
                        latitude: newPosition.coords.latitude,
                        longitude: newPosition.coords.longitude
                    };
                    
                    position = new google.maps.LatLng(coordinates.latitude, coordinates.longitude);
                    map.panTo(position);
                    that.putMyMarker(position);
                    that.putBuddiesMarkers();                    
                    //that.updateCoorinates(coordinates);

                    that.isLoading = false;
                    that.hideLoading();
                },
                function (error) {
                    position = new google.maps.LatLng(app.myCoordinates.latitude, app.myCoordinates.longitude);
                    map.panTo(position);
                    that.putMyMarker(position);
                    that.putBuddiesMarkers();
                    
                    that.isLoading = false;
                    that.hideLoading();

                    navigator.notification.alert("Unable to determine current location. Cannot connect to GPS satellite. Loading last saved location",
                                                 function () {
                                                 }, "Location failed", 'OK');
                },
                {
                timeout: 30000,
                enableHighAccuracy: true
            });            
        },

        onSearchBuddie: function () {
            var that = this;

            var foundBuddie = false;
            that.buddieNickname = that.get("buddieNickname");
            
            for (var i = 0; i < that.buddieMarkers.length; i++) {
                if (that.buddieMarkers[i].title === that.buddieNickname) {
                    map.panTo(that.buddieMarkers[i].position);
                    foundBuddie = true;
                }
            }
            
            if (!foundBuddie) {
                navigator.notification.alert("Unable to find buddie name in your friends.",
                                             function () {
                                             }, "Search failed", 'OK');
            }
        },

        onSearchAddress: function () {
            var that = this;

            geocoder.geocode(
                {
                'address': that.get("address")
            },
                function (results, status) {
                    if (status !== google.maps.GeocoderStatus.OK) {
                        navigator.notification.alert("Unable to find address.",
                                                     function () {
                                                     }, "Search failed", 'OK');

                        return;
                    }

                    map.panTo(results[0].geometry.location);
                    map.panTo(results[0].geometry.location);
                    that.putMyMarker(results[0].geometry.location);
                });
        },

        putMyMarker: function (position) {
            var that = this;

            if (that.myMarker !== null && that.myMarker !== undefined) {
                that.myMarker.setMap(null);
            }
            
            that.myMarker = new google.maps.Marker({
                map: map,
                position: position,
                title: app.nickname,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    strokeColor: "#0000FF",
                    scale: 8
                }
            });
        },

        putBuddiesMarkers: function () {
            var that = this;
            that.buddieMarkers = [];
            
            var buddies = app.buddies || [];
            for (var i = 0; i < buddies.length; i++) {
                var buddie = buddies[i];
                var position = new google.maps.LatLng(buddie.latitude, buddie.longitude);
                var isBuddieOnline = JSON.parse(buddie.isOnline || false);
                var buddieColor;
                if (isBuddieOnline) {
                    buddieColor = "#00FF00";
                }
                else {
                    buddieColor = "#FF0000";
                }
                
                var marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    title: buddie.nickname,
                    icon: {
                        path: google.maps.SymbolPath .BACKWARD_CLOSED_ARROW,
                        strokeColor: buddieColor,
                        scale: 4
                    }
                });
                
                that.buddieMarkers.push(marker);
            }
        },

        showLoading: function () {
            if (this.isLoading) {
                app.application.showLoading();
            }
        },

        hideLoading: function () {
            app.application.hideLoading();
        },
        
        updateCoorinates: function(coordinates) {
            app.myCoordinates = coordinates;
            httpRequester.postJSON(app.servicesBaseUrl + "coordinates/update?sessionKey=" + that.sessionKey, coordinates);
        }
    });

    app.mapService = {
        initLocation: function () {
            var mapOptions = {
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM
                },
    
                mapTypeControl: false,
                streetViewControl: false
            };

            map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);            
            geocoder = new google.maps.Geocoder();
            app.mapService.viewModel.onNavigateHome.apply(app.mapService.viewModel, []);
        },

        show: function () {
            //show loading mask in case the location is not loaded yet 
            //and the user returns to the same tab
            app.mapService.viewModel.showLoading();
            
            //resize the map in case the orientation has been changed while showing other tab
            google.maps.event.trigger(map, "resize");
        },

        hide: function () {
            //hide loading mask if user changed the tab as it is only relevant to location tab
            app.mapService.viewModel.hideLoading();
        },

        viewModel: new MapViewModel()
    };
})(window);