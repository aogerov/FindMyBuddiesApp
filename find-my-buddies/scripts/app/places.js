var app = app || {};

(function(a) {
    /*function getAllPlaces(options){
    httpRequest.getJSON(app.servicesBaseUrl  + "places")
    .then(function(places){
    ret
    });
    }*/
    function getAlphabetically() {
        httpRequest.getJSON(app.servicesBaseUrl  + "places")
        .then(function(places) {
            viewModel.set("places", places); 
            console.log(places);
        });
    }
    
    function getByLocation() {
        coordinates.getLocation().
        then(function(location) {
            var locationString = location.coords.latitude + "," + location.coords.longitude;            
            return httpRequest.getJSON(app.servicesBaseUrl  + "places?location=" + locationString);     
        })
        .then(function(places) {
            viewModel.set("places", places); 
            console.log(places);
        });
    }
    
    var viewModel = kendo.observable({
        places:[],
        getAlphabetically: getAlphabetically,
        getByLocation: getByLocation
    });
    
    function init(e) {
        kendo.bind(e.view.element, viewModel);
        getAlphabetically();
    }   
    
    a.places = {
        init:init          
    };
}(app));