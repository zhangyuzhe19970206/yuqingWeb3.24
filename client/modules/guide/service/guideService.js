"use strict";
angular.module('guideService',['commons'])
    .factory("GuideFac", ['$resource', 'parseResource', function ($resource, parseResource) {
        var factories = {};
        // factories.eventData = $resource(CQ.variable.RESTFUL_URL + "/text_generation/get_all_events", parseResource.params, parseResource.actions);
        // factories.aspectData = $resource(CQ.variable.RESTFUL_URL + "/text_generation/get_all_aspect", parseResource.params, parseResource.actions);
        // factories.textGenerate = $resource(CQ.variable.RESTFUL_URL + "/text_generation/text_generate", parseResource.params, parseResource.actions);
        factories.eventData = $resource("http://118.190.133.203:8100" + "/yqdata/text_generation/get_all_events", parseResource.params, parseResource.actions);
        factories.aspectData = $resource("http://118.190.133.203:8100" + "/yqdata/text_generation/get_all_aspect", parseResource.params, parseResource.actions);
        factories.textGenerate = $resource("http://118.190.133.203:8100" + "/yqdata/text_generation/text_generate", parseResource.params, parseResource.actions);
        // factories.textPost = $resource("http://118.190.133.203:8100" + "/yqdata/text_generation/post_text", parseResource.params, parseResource.actions);
        return factories;
    }])
    .factory("GuideFacService",['GuideFac', 'RestService', '$http', function(GuideFac, RestService, $http) {
        var factories = {};
        factories.getEventData = function(params) {
            return RestService.get(GuideFac.eventData, params);
        };
        factories.getAspectData = function(params) {
            return RestService.get(GuideFac.aspectData, params);
        };
        factories.getTextGenerate = function(params) {
            return RestService.get(GuideFac.textGenerate, params);
        };
        factories.postText = function(params) {
            // return RestService.get(GuideFac.textPost, params);
            return $http.post("http://118.190.133.203:8100/yqdata/text_generation/post_text", params);
        };
        return factories;
    }]);