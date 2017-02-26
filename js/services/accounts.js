/*global Firebase, console, angular */
angular.module('generic-client.services.accounts', [])

    .factory('authInterceptor', function (API, Auth, $location) {
        'use strict';
        return {
            // Automatically attach headers
            request: function (config) {
                var token = Auth.getToken();

                if (token && config.url.indexOf(API) === 0) {
                    config.headers.Authorization = 'JWT ' + token;
                }

                var language = Auth.getLanguage();

                if (language) {
                    config.headers["Accept-Language"] = language;
                }

                return config;
            },

            // If a token was sent back, save it
            response: function (res) {
                if (res.data) {
                    if (res.data.token && res.config.url.indexOf(API) === 0 &&
                        typeof res.data.token != 'undefined') {
                        Auth.saveToken(res.data.token);
                        Auth.saveUser(res.data.user);
                        Auth.saveLanguage(res.data.user);
                    }
                }

                return res;
            },
            // Redirect to login if unauthorised
            responseError: function (res) {
                if (res.status === 401 || res.status === 403) {
                    Auth.logout();
                    $location.path('/login');
                }

                return res;
            }
        };
    })

    .service('Auth', function ($window) {
        'use strict';

        var self = this;

        // Add JWT methods here
        self.parseJwt = function (token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse($window.atob(base64));
        };

        self.saveToken = function (token) {
            $window.localStorage.setItem('jwtToken', token);
        };

        self.saveUser = function (user) {
            $window.localStorage.setItem('user', JSON.stringify(user));
        };

        self.saveLanguage = function (user) {
            $window.localStorage.setItem('language', user.language);
        };

        self.getToken = function () {
            var token = $window.localStorage.getItem('jwtToken');

            // Check that not an undefined var and not an undefined string
            if (typeof token != 'undefined' && token !== "undefined") {
                return token;
            }

            return null;
        };

        self.getUser = function () {
            return JSON.parse($window.localStorage.getItem('user'));
        };

        self.getLanguage = function () {
            return $window.localStorage.getItem('language');
        };

        self.isAuthed = function () {
            var token = self.getToken();
            if (token) {
                var params = self.parseJwt(token);
                return Math.round(new Date().getTime() / 1000) <= params.exp;
            } else {
                return false;
            }
        };

        self.logout = function () {
            $window.localStorage.removeItem('jwtToken');
            $window.localStorage.removeItem('user');
            $window.localStorage.removeItem('myTransactions');
            $window.localStorage.removeItem('wiCode');

            if (typeof window.cookies != 'undefined') {
                window.cookies.clear();
            }
        };
    })

    .service('User', function ($http, API, COMPANY, Auth) {
        'use strict';
        var self = this;

        // add authentication methods here
        self.register = function (first_name, email, password1, password2) {
            return $http.post(API + '/auth/register/', {
                first_name: first_name,
                email: email,
                company_id: COMPANY,
                password1: password1,
                password2: password2
            }).then(function (res) {
                if (typeof res.data.token != 'undefined') {
                    Auth.saveToken(res.data.token);
                    Auth.saveUser(res.data.user);
                    Auth.saveLanguage(res.data.user);
                }
                return res;
            });
        };

        self.login = function (identifier, password) {
            return $http.post(API + '/auth/login/', {
                identifier: identifier,
                company_id: COMPANY,
                password: password
            })
        };

        self.resetPassword = function (identifier, company_id) {
            return $http.post(API + '/auth/password/reset/', {
                identifier: identifier,
                company_id: COMPANY
            })
        };

        self.partialUpdate = function (jsonUpdate) {
            return $http.patch(API + '/users/profile/', jsonUpdate)
        };

        // self.sendOtp = function () {
        //     return $http.post(API + '/send_otp/', {});
        // };

        self.verify = function (otp) {
            return $http.post(API + '/auth/mobile/verify/', {
                'otp': otp
            });
        };

        self.getCurrent = function () {
            return Auth.getUser();
        };

        self.getInfo = function () {
            return $http.get(API + '/users/profile/', {});
        }
    })

    .service('CompanyDetails', function ($http, API, Auth) {
        'use strict';
        var self = this;

        self.get = function () {
            return $http.get(API + '/users/company/');
        };
    });