"use strict";

angular.module('systemsettingService',['commons'])
    .factory('adminattrService', ['$http', function($http){
        var factories = {};
        factories.getUserattrData = function() {
            return $http.get("http://39.102.48.39:8090/yqdata/user_attr");
        };
        return factories;
    }]);