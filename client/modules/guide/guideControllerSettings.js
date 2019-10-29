"use strict";
CQ.mainApp.guideController
    .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider){
        $stateProvider
            .state("guide", {
                url: "/guide",
                templateUrl: "/static/modules/guide/pages/guide.html",
                controller: "guideController"
            })
    }]);