(function (global) {
    var BuddiesViewModel;
    var app = global.app = global.app || {};
    var defaulfCoordinates = {
        latitude: "43.465187",
        longitude: "-80.522372"
    };

    BuddiesViewModel = kendo.data.ObservableObject.extend({
        username: "",
        password: "",
        sessionKey: "",
        nickname: "",
        isLoggedIn: false,
        isLoginActive: true,
        isRegisterActive: false,
        isFindBuddieActive: false,
        isFindResultActive: false,
        isBuddieFound: false,
        isRequestAnswered: true,
        buddieNickname: "",
        buddieData: {},
        buddieRequests: [],
        onlineBuddies: [],
        offlineBuddies: [],
        findResult: "",
        
        init: function () {
            var that = this;
            kendo.data.ObservableObject.fn.init.apply(that, []);
            
            var storageLoggedData = window.localStorage.getItem("loggedData");
            if (storageLoggedData) {
                var loggedData = JSON.parse(storageLoggedData);
                app.sessionKey = loggedData.sessionKey;
                app.nickname = loggedData.nickname;
                app.isLoggedIn = JSON.parse(loggedData.isLoggedIn || false);
            
                that.set("sessionKey", loggedData.sessionKey); 
                that.set("nickname", loggedData.nickname); 
                that.set("isLoggedIn", app.isLoggedIn);    
            }
            
            app.myCoordinates = defaulfCoordinates;
        },       

        onLogin: function () {        
            var that = this;            
            var username = that.get("username").trim();
            var password = that.get("password").trim();

            var areFieldsValid = that.validateLoginFields(username, password);
            if (areFieldsValid) {
                app.application.showLoading(); 
                var loginData = {
                    username : username,
                    authCode : CryptoJS.SHA1(username + password).toString()
                }
                
                httpRequester.postJSON(app.servicesBaseUrl + 'users/login', loginData)
                .then(function(data) {
                    that.setLoggedInData(data);
                    that.updateCoorinates();
                    that.getAllBuddies();
                }, function(error) {
                    app.application.hideLoading(); 
                    navigator.notification.alert("Server error!",
                                                 function () {
                                                 }, "Login failed", 'OK');
                });
            }
        },

        onRegister: function () {         
            var that = this;
            var username = that.get("username").trim();
            var nickname = that.get("nickname").trim();
            var password = that.get("password").trim();
            
            var areFieldsValid = that.validateRegisterFields(username, nickname, password);
            if (areFieldsValid) {
                app.application.showLoading(); 
                var registerData = {
                    username : username,
                    nickname : nickname,
                    authCode : CryptoJS.SHA1(username + password).toString()
                }
                
                httpRequester.postJSON(app.servicesBaseUrl + 'users/register', registerData)
                .then(function(data) {
                    that.setLoggedInData(data);
                    that.updateCoorinates();
                    that.getAllBuddies();
                }, function(error) {
                    app.application.hideLoading(); 
                    navigator.notification.alert("Server error!",
                                                 function () {
                                                 }, "Register failed", 'OK');
                });
            }
        },

        onLogout: function () {
            httpRequester.getJSON(app.servicesBaseUrl + 'users/logout?sessionKey=' + this.sessionKey)
            .then(function(data) { 
            }, function(error) {
                //navigator.notification.alert("Server error!",
                //function () {
                //}, "Logout failed", 'OK');
            });
            
            window.localStorage.setItem("loggedData", JSON.stringify({
                sessionKey: "",
                nickname: "",
                isLoggedIn: "false"
            })); 
            
            app.sessionKey = "";
            app.nickname = "";
            app.isLoggedIn = false;
            
            this.clearForm();
        },
        
        onSwitchLoginRegister: function() {
            if (this.isLoginActive) {
                this.set("isLoginActive", false);                    
                this.set("isRegisterActive", true);
            }
            else {
                this.set("isLoginActive", true);                    
                this.set("isRegisterActive", false);
            }
        },
        
        onActivateFindBuddie: function() {
            if (this.isFindBuddieActive) {
                this.set("isFindBuddieActive", false);
            }
            else {
                this.set("isFindBuddieActive", true);
            }
        },
        
        onSearchBuddie: function() {
            var that = this;
            
            if (that.validateNickname(that.buddieNickname) === false) {
                return;
            }
            
            httpRequester.getJSON(app.servicesBaseUrl + 'friends/find?friendNickname=' + that.buddieNickname + '&sessionKey=' + that.sessionKey)
            .then(function(data) {
                that.setFoundFriend(data);
            }, function(error) {
                navigator.notification.alert("Server error!",
                                             function () {
                                             }, "Search failed", 'OK');
            });
        },
        
        onSendFindRequest: function() {
            var that = this;
            
            httpRequester.postJSON(app.servicesBaseUrl + 'requests/add?sessionKey=' + that.sessionKey, that.buddieData)
            .then(function(data) {
            }, function(error) {
                //navigator.notification.alert("Server error!",
                //                             function () {
                //                             }, "Send request failed", 'OK');
            });
            
            this.set("buddieNickname", "");
            this.set("isFindBuddieActive", false);
            this.set("isFindResultActive", false);
            this.set("isBuddieFound", false);
        },
        
        onUpdateBuddies: function() {
            this.getAllBuddies();
        },
        
        setLoggedInData: function(data) {
            data.isLoggedIn = true;
            window.localStorage.setItem("loggedData", JSON.stringify(data));
            
            app.sessionKey = data.sessionKey;
            app.nickname = data.nickname;
            app.isLoggedIn = data.isLoggedIn;
            
            this.set("sessionKey", data.sessionKey);
            this.set("nickname", data.nickname);              
            this.set("isLoggedIn", data.isLoggedIn);
        },
        
        updateCoorinates: function() { 
            var that = this;
            
            coordinates.getLocation().
            then(function(position) {
                var coordinates = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                app.myCoordinates = coordinates;
                httpRequester.postJSON(app.servicesBaseUrl + "coordinates/update?sessionKey=" + that.sessionKey, coordinates);
            });
        },
        
        getAllBuddies: function() {  
            var that = this;
            
            httpRequester.getJSON(app.servicesBaseUrl + 'requests/all?sessionKey=' + that.sessionKey)
            .then(function(data) {
                that.set("buddieRequests", data);
            });
            
            httpRequester.getJSON(app.servicesBaseUrl + 'friends/all?sessionKey=' + that.sessionKey)
            .then(function(data) {
                app.buddies = data;
                var onlineBuddies = [];
                var offlineBuddies = [];
                
                for (var i = 0; i < data.length; i++) {
                    if (data[i].isOnline) {
                        onlineBuddies.push(data[i]);
                    }
                    else {
                        offlineBuddies.push(data[i]);
                    }
                }
                
                that.set("onlineBuddies", onlineBuddies);
                that.set("offlineBuddies", offlineBuddies);   
                app.application.hideLoading();
            }, function(error) {
                app.application.hideLoading();                
                navigator.notification.alert("Server error!",
                                             function () {
                                             }, "Could not connect to buddies base", 'OK');
            });
        },
        
        setFoundFriend: function(data) {
            var resultText;            
            if (data != null) {
                this.set("isBuddieFound", true);
                this.buddieData = data;
                resultText = data.nickname;
                if (data.isOnline) {
                    resultText += " (online)";
                }
                else {
                    resultText += " (not online)";
                }
            }
            else {
                this.set("isBuddieFound", false);
                resultText = "no matches found";
            }
            
            this.set("findResult", resultText);
            this.set("isFindResultActive", true);
        },

        clearForm: function () {
            this.set("username", "");
            this.set("nickname", "");
            this.set("password", "");                            
            this.set("isLoginActive", true);                 
            this.set("isRegisterActive", false);
            this.set("isLoggedIn", false);
            this.set("buddieRequests", []);
            this.set("onlineBuddies", []);
            this.set("offlineBuddies", []);
        },        
          
        validateNickname: function(nickname) {
            var isNicknameValid = this.validateInputField(nickname);
            if (!isNicknameValid) {
                navigator.notification.alert("nickname has to be min 6 chars and max 30 chars long!",
                                             function () {
                                             }, "Register failed", 'OK');
                return false;
            }
            
            return true;
        },     
        
        validateLoginFields: function(username, password) {
            var isUsernameValid = this.validateInputField(username);
            if (!isUsernameValid) {
                navigator.notification.alert("username has to be min 6 chars and max 30 chars long!",
                                             function () {
                                             }, "Login failed", 'OK');
                return false;
            }
            
            var isPasswordValid = this.validateInputField(password);
            if (!isPasswordValid) {
                navigator.notification.alert("password has to be min 6 chars and max 30 chars long!",
                                             function () {
                                             }, "Login failed", 'OK');
                return false;
            }
            
            return true;
        },        
                
        validateRegisterFields: function(username, nickname, password) {
            var isUsernameValid = this.validateInputField(username);
            if (!isUsernameValid) {
                navigator.notification.alert("username has to be min 6 chars and max 30 chars long!",
                                             function () {
                                             }, "Register failed", 'OK');
                return false;
            }
            
            var isNicknameValid = this.validateInputField(nickname);
            if (!isNicknameValid) {
                navigator.notification.alert("nickname has to be min 6 chars and max 30 chars long!",
                                             function () {
                                             }, "Register failed", 'OK');
                return false;
            }
            
            var isPasswordValid = this.validateInputField(password);
            if (!isPasswordValid) {
                navigator.notification.alert("password has to be min 6 chars and max 30 chars long!",
                                             function () {
                                             }, "Register failed", 'OK');
                return false;
            }
            
            return true;
        },
        
        validateInputField: function(inputField) {
            if (inputField.length < 6 || inputField.length > 30) {                
                return false;
            }
            else {
                return true;
            }
        },
        
        answerRequest: function(ev) {    
            var that = this;
            
            var response = {
                fromUserId: ev.dataItem.fromUserId,
                fromUserNickname: ev.dataItem.fromUserNickname,
                isAccepted: true,
                isLeftForLater: false
            };
        
            that.set("isRequestAnswered", false);
            httpRequester.postJSON(app.servicesBaseUrl + "requests/response?sessionKey=" + that.sessionKey, response);
            //.then(httpRequester.getJSON(app.servicesBaseUrl + 'requests/all?sessionKey=' + that.sessionKey)
            //.then(function(data) {
            //    that.set("buddieRequests", data);
            //}));
        }
    });

    app.buddiesService = {
        viewModel: new BuddiesViewModel()
    };
})(window);