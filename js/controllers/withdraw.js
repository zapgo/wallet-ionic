angular.module('generic-client.controllers.withdraw', [])

    .controller('WithdrawToCtrl', function ($scope, $state, $window, $ionicHistory, $stateParams, BitcoinWithdrawalAccount, BankAccount) {
        'use strict';
        $scope.items = [{'title': 'Bank account', 'accType': 'bank_account'}];
        $scope.data = {};
        $scope.accType = $stateParams.accType;

        if ($stateParams['account']) {
            $ionicHistory.goBack(-2);
            $state.go('app.withdraw_amount', {account: $stateParams['account']});
        }

        if ($scope.accType == 'bitcoin_account') {

            $scope.listData = function () {
                BitcoinWithdrawalAccount.list().success(
                    function (res) {
                        var items = [];
                        for (var i = 0; i < res.data.length; i++) {
                            items.push(res.data[i]);
                        }
                        $scope.items = items;
                        $window.localStorage.setItem('myBitcoinWithdrawalAccounts', JSON.stringify(items));
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                );

            };
            $scope.listData();
        }
        else if ($scope.accType == 'bank_account') {

            $scope.listData = function () {
                BankAccount.list().success(
                    function (res) {
                        var items = [];
                        for (var i = 0; i < res.data.length; i++) {
                            items.push(res.data[i]);
                        }
                        $scope.items = items;
                        $window.localStorage.setItem('myBankAccounts', JSON.stringify(items));
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                );

            };
            $scope.listData();
        }

        $scope.submit = function (accType) {

            var withdraw_dict = {
                accType: accType
            };
            var next = 'app.withdraw_to';
            if (accType == 'bank_account') {
                next = 'app.withdraw_to_bank_account';
            }
            else if (accType == 'bitcoin_account') {
                next = 'app.withdraw_to_bitcoin_account';
            }
            $state.go(next, withdraw_dict);
        };

    })

    .controller('WithdrawAmountCtrl', function ($scope, $state, $stateParams) {
        'use strict';
        $scope.data = {};
        $scope.account = $stateParams.account;

        $scope.submit = function (form) {
            if (form.$valid) {
                $state.go('app.withdraw_confirm', {
                    amount: form.amount.$viewValue,
                    account: $scope.account
                });
            }
        };
    })

    .controller('WithdrawConfirmCtrl', function ($scope, $state, $window, $stateParams, $ionicLoading, $ionicPopup, $translate, Withdrawal, Conversions) {
        'use strict';
        $scope.data = {};
        $scope.amount = $stateParams.amount;
        $scope.account = $stateParams.account;
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));

        $scope.submit = function (amount, account) {
            $ionicLoading.show({
                template: $translate.instant("LOADER_PROCESSING")
            });

            Withdrawal.create(Conversions.to_cents(amount), account).then(function (res) {
                if (res.status === 201) {
                    $ionicLoading.hide();
                    $state.go('app.withdraw_success', {
                        amount: amount,
                        reference: account
                    });
                } else {
                    $ionicLoading.hide();
                    $ionicPopup.alert({title: $translate.instant("ERROR"), template: res.data.message});
                }
            }).catch(function (error) {
                $ionicPopup.alert({title: $translate.instant("AUTHENTICATION_ERROR"), template: error.message});
                $ionicLoading.hide();
            });
        };
    })

    .controller('WithdrawSuccessCtrl', function ($scope, $state, $window, $stateParams) {
        'use strict';
        $scope.data = {};
        $scope.amount = $stateParams.amount;
        $scope.currency = JSON.parse($window.localStorage.getItem('myCurrency'));
    });