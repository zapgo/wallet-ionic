angular.module('generic-client.controllers.fica', [])

    .controller('FicaRequirementsCtrl', function ($scope, $state) {
        'use strict';
        $scope.data = {};
    })

    .controller('FicaIdCtrl', function ($scope, $state) {
        'use strict';
        $scope.data = {type: "id"};

        $scope.submit = function (type) {
            $state.go('app.fica_camera_upload', {
                type: $scope.data.type
            });
        };
    })

    .controller('FicaIdSelfieCtrl', function ($scope, $state) {
        'use strict';
        $scope.data = {type: "id_selfie"};

        $scope.submit = function (type) {
            $state.go('app.fica_camera_upload', {
                type: $scope.data.type
            });
        };
    })

    .controller('FicaProofOfAddressCtrl', function ($scope, $state) {
        'use strict';
        $scope.data = {type: "proof_of_address"};

        $scope.submit = function (type) {
            $state.go('app.fica_camera_upload', {
                type: $scope.data.type
            });
        };
    })

    .controller('FicaCameraUploadCtrl', function ($scope, Upload, Auth, API, $ionicLoading, $ionicPopup, $cordovaFileTransfer, $cordovaCamera) {
        'use strict';
        $scope.submit = function () {
            if ($scope.form.file.$valid && $scope.file) {
                $scope.upload($scope.file);
            }
        };

        // upload on file select or drop
        $scope.upload = function (file) {

        };

        $scope.getPicture = function (file) {
            'use strict';
            document.addEventListener("deviceready", function () {
                if (ionic.Platform.isIOS()) {
                    var ios_options = {
                        quality: 100,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: true,
                        encodingType: Camera.EncodingType.JPEG,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: true
                    };

                    $cordovaCamera.getPicture(ios_options).then(function (file) {
                        Upload.upload({
                            url: API + "/users/document/",
                            data: {file: file, document_category: "", document_type: ""},
                            headers: {'Authorization': 'JWT ' + Auth.getToken()}
                        }).progress(function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                        }).success(function (data, status, headers, config) {
                            $ionicPopup.alert({title: "Image Uploaded"});
                        }).error(function (data, status, headers, config) {
                            alert('error status: ' + status);
                        });
                    }, function (err) {
                        window.alert(err);
                    });
                } else if (ionic.Platform.isAndroid()) {
                    var android_options = {
                        quality: 100,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: true,
                        encodingType: Camera.EncodingType.JPEG,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: false
                    };

                    $cordovaCamera.getPicture(android_options).then(function (file) {
                        $ionicLoading.show({
                            template: 'Uploading...'
                        });

                        var options = {
                            url: API + "/users/document/",
                            data: {file: file, document_category: "", document_type: ""},
                            headers: {'Authorization': 'JWT ' + Auth.getToken()}
                        };

                        $cordovaFileTransfer.upload(API + '/users/document/', imagePath, options).then(function (result) {
                            $ionicLoading.hide();
                            $ionicPopup.alert({title: "Image Uploaded"});
                        }, function (err) {
                            $ionicPopup.alert({title: 'Error', template: JSON.stringify(err)});
                            $ionicLoading.hide();
                        }, function (progress) {
                            // constant progress updates
                        });
                    });
                } else {
                    $ionicLoading.show({
                        template: 'Uploading...'
                    });
                    Upload.upload({
                        url: API + "/users/document/",
                        data: {file: file, document_category: "", document_type: ""},
                        headers: {'Authorization': 'JWT ' + Auth.getToken()}
                    }).then(function (resp) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({title: "Success", template: "Upload complete."});
                        console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                    }, function (resp) {
                        console.log('Error status: ' + resp.status);
                    }, function (evt) {
                        $ionicLoading.hide();
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                    });
                }
            }, false);
        };

    });
