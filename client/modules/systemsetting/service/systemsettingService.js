"use strict";

angular.module('systemsettingService',['commons'])
    // .factory('UserattrService', ['$http', function($http){
    //     var factories = {};
    //     factories.getUserattrData = function() {
    //         return $http.get("http://39.102.48.39:8090/yqdata/user_attr");
    //     };
    //     return factories;
    // }])
    .factory('Userattr', ['$resource','parseResource',function($resource,parseResource){
        var factories = {};
        factories.userattrData = $resource(CQ.variable.RESTFUL_URL + "user_attr", parseResource.params, parseResource.actions);
        return factories;
    }])
    .factory("UserattrService",['Userattr', 'RestService', '$http',function(Userattr, RestService,$http) {
        var factories = {};
        factories.getUserattrData = function(params) {
            return RestService.get(Userattr.userattrData, params);
        };
        factories.updUserAttr = function(data){
            return $http.post(CQ.variable.RESTFUL_URL + "", data);
        };
        return factories;
    }])
    // .factory('PostuserattrService', ['$http', function($http){
    //     var factories={};
    //     factories.updUserAttr = function(data){
    //         return $http.post(CQ.variable.RESTFUL_URL + "user_attr", data);
    //     };
    // }]);
