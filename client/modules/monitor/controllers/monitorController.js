"use strict";
CQ.mainApp.monitorController.controller("monitorController", ["$rootScope", "$scope", "$interval", "ngDialog", "MonitorFacService", "$location", "$stateParams", "$state", "$http","$sce", "PostDataService_", "$timeout", "notice", function($rootScope, $scope, $interval, ngDialog, MonitorFacService, $location, $stateParams, $state, $http, $sce, PostDataService_, $timeout, notice) {
    console.log("monitorController", "start!!!");
    //页面UI初始化；
    console.log("$stateParams",$stateParams);
    $scope.kwds_show=false;
    $scope.topic_id = null;
    $scope.monitortopic_id = null;
    $scope.monitorData = null;
    $scope.topicLists = null;
    $scope.dataType = $stateParams.dataType;
    $scope.siteId = $stateParams.siteId;
    $rootScope.freshLists = $rootScope.freshLists || [];
    $scope.bufferData = {};
    $rootScope.freshLists.forEach(function(d, i) {
        while ($interval.cancel(d));
        console.log($interval.cancel(d));
    });
    $rootScope.freshLists = [];
    $scope.cons = {};
    $scope.date = getFormatData();
    $scope.lastDate = $scope.date;
    $scope.pics = ["/static/assets/img/news2.svg", "/static/assets/img/luntan.svg", "/static/assets/img/weibo.svg", "/static/assets/img/tieba.svg", "/static/assets/img/weixin1.svg", "/static/assets/img/baidu.svg"];
    $scope.newMonitorList = [];
    $scope.$on('$viewContentLoaded', function() {
        if ($rootScope.mainController) {
            console.log("monitor app start!!!");
            var url1 = CQ.variable.RESTFUL_URL + "/batchsetui";
            $http.get(url1).success(function(data) {
                console.log(data.data);
                $scope.senduser = data.data;
                $scope.senduser2 = [];
                var color = d3.scale.category20();
                if ($scope.senduser != '普通用户权限不足') $scope.senduser2 = $scope.senduser.map((d, i) => {
                    return {
                        'user_': d,
                        'color': color(i),
                        'index': i - 1
                    }
                });
                $scope.senduser2.splice(0, 1);
                console.log($scope.senduser2);
                $('#users').selectize({
                    persist: false,
                    createOnBlur: true,
                    create: false,
                    sortField: {
                        field: 'user_',
                        direction: 'asc'
                    },
                    valueField: 'index',
                    labelField: 'user_',
                    //options:[{'user_':'yuqing'},{'user_':'admin'}],
                    options: $scope.senduser2,
                    onItemAdd: function(v, el) {
                        el.css({
                            'background-color': $scope.senduser2[v].color
                        });
                        $scope.newMonitorList.push($scope.senduser2[v].user_);
                        // console.log($scope.recid);
                    },
                    onItemRemove: function(v) {
                        var index = ($scope.newMonitorList.indexOf($scope.senduser2[v].user_));
                        $scope.newMonitorList.splice(index, 1);
                        // console.log($scope.recid);
                    }
                });
            });
            App.runui();
            getMonitorData();
        }
    });

    $("#datepicker-default").datepicker({
        todayHighlight: true,
        autoclose: true,
        format: 'yyyy-mm-dd'
    }).datepicker('setEndDate', getFormatData()).on('changeDate', function(ev) {
        $scope.monitorData = [];
        if ($scope.date == "") {
            $scope.date = $scope.lastDate;
        } else {
            $scope.lastDate = $scope.date;
        }
        $rootScope.freshLists.forEach(function(d) {
            $interval.cancel(d);
        });
        setTimeout(function() {
            $scope.$apply(function() {
                getMonitorData();　　　 //在这里去手动触发脏检查
            });
        }, 1000);
    });
    $("#datepicker-default1").datepicker({
        todayHighlight: true,
        autoclose: true,
        format: 'yyyy-mm-dd'
    }).datepicker('setEndDate', getFormatData()).on('changeDate', function(ev) {
        $scope.monitorData = [];
        if ($scope.date == "") {
            $scope.date = $scope.lastDate;
        } else {
            $scope.lastDate = $scope.date;
        }
        $rootScope.freshLists.forEach(function(d) {
            $interval.cancel(d);
        });
        setTimeout(function() {
            $scope.$apply(function() {
                getMonitorData();　　　 //在这里去手动触发脏检查
            });
        }, 1000);
    });
    function strlen(str){
        var len = 0;
        for (var i=0; i<str.length; i++) {
            var c = str.charCodeAt(i);
            //单字节加1
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
                len++;
            }
            else {
                len+=2;
            }
        }
        return len;
    };
    $scope.show_kwds=function(kwds){
        $scope.kwds_show = true;
        $scope.kwds = "";
        kwds.forEach(function(k){
            $scope.kwds = $scope.kwds + k + ',';
        });
        $scope.kwds = $scope.kwds.slice(0,-1);
        var e;
        e = window.event;
        var x = e.clientX;
        var y = e.clientY;
        console.log(e);
        $("#kwds").css("position","fixed").css("top",(y+7) +"px").css("left",(x-145) +"px");
    };
    $scope.close_kwds = function(){
        $scope.kwds_show = false;
    };
    function getMonitorData() {
        var cons = {};
        cons.dataType = $scope.dataType;
        cons.siteId = $scope.siteId;
        cons.date = $scope.date;
        cons.pageCount = 20;
        $scope.cons = angular.copy(cons);
        $(".loader").show();
        console.log('cons',cons);
        MonitorFacService.getMonitorData(cons).then(function(res) {
            console.log('res',res);
            res.unshift(res[res.length - 1]);
            res.splice(res.length - 1, 1);
            var topicWeight = {
                "十九大": 100,
                "高考": 90,
                "成考": 80,
                "作弊": 70,
                "全部": -100
            };
            res.sort(function(a, b) {
                var weight_a = topicWeight[a.topicName] || 0;
                var weight_b = topicWeight[b.topicName] || 0;
                return weight_b - weight_a > 0 ? 1 : -1;
            });
            $scope.monitorData = res;
            var topicLists = [];
            var topicName_max_length = 0;
            $scope.monitorData.forEach(function (d) {
                var topicName_len = 0;
                topicName_len = strlen(d.topicName);
                if (topicName_max_length < topicName_len) {
                    topicName_max_length = topicName_len
                }
            });

            $timeout(function(){
                //console.log('topic_analysis',document.getElementsByClassName('f-s-18 btn btn-icon btn-circle btn-success'));
                //console.log('topic_analysis_-1', document.getElementById('topic_analysis_-1'));
                document.getElementById('topic_analysis_-1').style.visibility = "hidden";
            });
            //$scope.monitorData = $sce.trustAsHtml('<span>Some HTML code</span>');
            $scope.monitorData.forEach(function(d) {
                d.fresh = true;
                d.username = $rootScope.curentUser;
                d.bgColor = "#337ab7";
                d.visibile = 'visible';
                d.align_topicName =  d.topicName + (" &nbsp;").repeat((topicName_max_length - strlen(d.topicName)));
                if (d.topicName==='全部')
                {
                    d.visible = 'hidden';
                }
                d.align_topicName = $sce.trustAsHtml(d.align_topicName);
                if (d.postData.length < cons.pageCount) {
                    d.isLoad = false;
                } else {
                    d.isLoad = true;
                }
                // var tl = {};
                // tl.topicId = d.topicId;
                // tl.newTime = d.newTime;
                // tl.fresh = true;
                // topicLists.push(tl);
                // d.postData.forEach(function(post){
                //     var max_users = 20;
                //     var max_display = 18;
                //     if(Math.random() < 0.8)
                //         post.img_url = "/static/assets/img/display/" + ~~(max_display * Math.random() + 1) + ".jpg";
                //     post.poster = post.poster || {};
                //     post.poster.img_url = "/static/assets/img/user/user-" + ~~(max_users * Math.random() + 1) + ".jpg";
                // });
            });
            $scope.myMonitorData = $scope.monitorData;
            console.log("monitorData",$scope.monitorData);
            // $scope.freshTopicLists = topicLists;
            getFreshData(cons);
        }, function(error) {
            console.log(error);
            notice.notify_info("抱歉！", "数据请求出错，请重试！", "", false, "", "");
        });
    };
    // get format data
    function getFormatData() {
        var datetime = new Date();
        var year = datetime.getFullYear(); //获取完整的年份(4位,1970)
        var month = datetime.getMonth() + 1; //获取月份(0-11,0代表1月,用的时候记得加上1)
        if (month <= 9) {
            month = "0" + month;
        }
        var date = datetime.getDate(); //获取日(1-31)
        if (date <= 9) {
            date = "0" + date;
        }
        return year + "-" + month + "-" + date;
    }
    // fresh data
    function getFreshData(cons) {
        var ll = $interval(function() {
            var topicLists = [];
            $scope.monitorData.forEach(function(topic) {
                if (topic.fresh) {
                    topicLists.push({
                        topicId: topic.topicId,
                        newTime: topic.newTime
                    });
                }
            });
            $scope.getDataToBuffer(topicLists);
            //     $(".loads").slideDown("slow");
            //     var topicLists = [];
            //     $scope.monitorData.forEach(function (d) {
            //         var tl = {};
            //         tl.topicId = d.topicId;
            //         tl.newTime = d.newTime;
            //         topicLists.push(tl);
            //     });
            //     cons.topicLists = topicLists;
            //     //console.log(JSON.stringify(cons));
            //         PostDataService.flushData(cons).then(function(freshdata) {
            //             console.log(freshdata.data.data);
            //             var res = freshdata.data.data;
            //             $scope.monitorData.forEach(function(d) {
            //                 res.forEach(function(rr) {
            //                     if(rr.topicId == d.topicId){
            //                         d.newTime = rr.newTime;
            //                         if(rr.postData.length != 0) {
            //                             d.count = rr.count;
            //                             $(".addnums").slideDown("slow");
            //                             d.postData = rr.postData.concat(d.postData);
            //                         }
            //                     }
            //                 });
            //             });
            //             //console.log($scope.monitorData);
            //             $timeout(function(){
            //                 $(".addnums").slideUp("slow");
            //             }, 4000);
            //             $(".loads").slideUp("slow");
            //         },function(error) {
            //             $(".loads").slideUp("slow");
            //             console.log(error);
            //         });
        }, 30000);
        $rootScope.freshLists.push(ll);
    }
    $scope.$on('$destroy', function() {
        $rootScope.freshLists.forEach(function(d) {
            while ($interval.cancel(d));
        });
        // console.log(ll);
    });
    //查看组内实时监控
    $scope.groupMonitor = function() {
        var cons = {};
        cons.dataType = $scope.dataType;
        cons.siteId = $scope.siteId;
        cons.date = $scope.date;
        cons.pageCount = 20;
        cons.userlist = "";
        for (var i = 0; i < $scope.newMonitorList.length; i++) {
            cons.userlist = cons.userlist + $scope.newMonitorList[i];
            if (i != $scope.newMonitorList.length - 1) {
                cons.userlist = cons.userlist + ",";
            }
        }
        $scope.cons = angular.copy(cons);
        console.log($scope.cons);
        $(".loader").show();
        MonitorFacService.getGroupMonitorData(cons).then(function(res) {
            console.log("Here");
            console.log(res);
            $scope.groupMonitorData = res;
            for (var i = 0; i < $scope.groupMonitorData.length; i++) {
                if ($scope.groupMonitorData[i].postData.length < cons.pageCount) {
                    $scope.groupMonitorData[i].isLoad = false;
                } else {
                    $scope.groupMonitorData[i].isLoad = true;
                }
                for (var j = 0; j < $scope.senduser2.length; j++) {
                    if ($scope.groupMonitorData[i].username == $scope.senduser2[j].user_) {
                        $scope.groupMonitorData[i].bgColor = $scope.senduser2[j].color;
                    }
                }
            }
            $scope.monitorData = [];
            console.log($scope.myMonitorData);
            console.log($scope.groupMonitorData);
            $scope.monitorData = $scope.monitorData.concat($scope.myMonitorData);
            $scope.monitorData = $scope.monitorData.concat($scope.groupMonitorData);
            var topicLists = [];
            $scope.monitorData.forEach(function(d) {
                d.fresh = true;
            });
            console.log($scope.monitorData);
            getFreshData(cons);
        }, function(error) {
            console.log(error);
            notice.notify_info("抱歉！", "数据请求出错，请重试！", "", false, "", "");
        });
        console.log($scope.newMonitorList);
    };
    // move positions
    $scope.movePosition = function(topic_id) {
        console.log(topic_id);
        var ht = $("#topic_" + topic_id + "");
        if ($("#topic_" + topic_id + "")) {
            $("#topic_" + topic_id + "").hide("slow");
            $timeout(function() {
                $("#topicLists").prepend(ht);
                $("#topic_" + topic_id + "").fadeIn("slow");
            }, 1000);
        }
    };
    $scope.openDia = function(topic_id, topic_name) {
        $scope.topic_name = topic_name;
        ngDialog.open({
            template: '/static/modules/monitor/pages/openTopic.html',
            controller: 'openTopic',
            width: "40%",
            scope: $scope
        });
    };
    $scope.isfresh = function(topic_id) {
        console.log($scope.freshTopicLists);
        for (var i = 0; i < $scope.freshTopicLists.length; i++) {
            if ($scope.freshTopicLists[i].topicId == topic_id) {
                return $scope.freshTopicLists[i].fresh;
            }
        }
    }
    $scope.pausefresh = function(topic) {
        topic.fresh = false;
        // for(var i = 0; i < $scope.freshTopicLists.length; i++)
        // {
        //     if($scope.freshTopicLists[i].topicId == topic_id)
        //     {
        //         $scope.freshTopicLists[i].fresh = false;
        //         return;
        //     }
        // }
    }
    $scope.startfresh = function(topic) {
        topic.fresh = true;
        // for(var i = 0; i < $scope.freshTopicLists.length; i++)
        // {
        //     if($scope.freshTopicLists[i].topicId == topic_id)
        //     {
        //         $scope.freshTopicLists[i].fresh = true;
        //         return;
        //     }
        // }
    }
    //标记为已读
    $scope.markRead = function(post) {
        post.is_read = 1;
        console.log(post);
    }
    //把数据读入到缓存
    $scope.getDataToBuffer = function(topic_list) {
        // var topicLists = [];
        // $scope.monitorData.forEach(function (d) {
        //     if(d.topicId == topic_id) {
        //         var tl = {};
        //         tl.topicId = d.topicId;
        //         tl.newTime = d.newTime;
        //         topicLists.push(tl);
        //     }
        // });
        $scope.cons.topicLists = topic_list;
        var cons = $scope.cons;
        console.log(cons);
        PostDataService_.flushData(cons).then(function(freshdata) {
            // console.log(freshdata.data.data);
            $scope.monitorData.forEach(function(d) {
                res.forEach(function(rr) {
                    if (rr.topicId == d.topicId) {
                        var doms = "#topic_" + rr.topicId;
                        d.newTime = rr.newTime;
                        if (rr.postData.length != 0) {
                            d.bufferData = d.bufferData || [];
                            d.bufferData = rr.postData.concat(d.bufferData);
                            console.log(d.topicName + "buffer");
                            console.log(d);
                            $timeout(function() {
                                d.count = d.bufferData.length;
                            }, 0)
                            angular.element(doms).find(".addnums").fadeIn();
                            // angular.element(doms).find(".addnums").slideDown("slow");
                            //     $timeout(function(){
                            //         d.postData = rr.postData.concat(d.postData);
                            //     }, 100);
                            //d.postData = rr.postData.concat(d.postData);
                            //angular.element(doms).find(".addnums").slideUp("slow");
                        }
                    }
                });
            });
        }, function(error) {
            console.log(error);
        });
    }
    $scope.refreshData = function(topic_id) {
        var doms = "#topic_" + topic_id;
        angular.element(doms).find(".loads").slideDown("slow");
        angular.element(doms).find(".addnums").fadeOut();
        var topicLists = [];
        $scope.monitorData.forEach(function(d) {
            if (d.topicId == topic_id) {
                var tl = {};
                tl.topicId = d.topicId;
                tl.newTime = d.newTime;
                topicLists.push(tl);
            }
        });
        $scope.cons.topicLists = topicLists;
        var cons = $scope.cons;
        console.log(JSON.stringify($scope.cons));
        PostDataService_.flushData(cons).then(function(freshdata) {
            var res = freshdata.data.data;
            // if(res[0].postData.length>0){
            $scope.monitorData.forEach(function(d) {
                res.forEach(function(rr) {
                    if (rr.topicId == d.topicId) {
                        d.newTime = rr.newTime;
                        d.bufferData = d.bufferData || [];
                        if (rr.postData.length != 0) {
                            // d.count = rr.count;
                            // angular.element(doms).find(".addnums").slideDown("slow");
                            d.bufferData = rr.postData.concat(d.bufferData);
                            //d.postData = rr.postData.concat(d.postData);
                            //angular.element(doms).find(".addnums").slideUp("slow");
                        }
                        if (d.bufferData.length > 0) {
                            $timeout(function() {
                                d.postData.forEach(d => {
                                    if (d.flag) {
                                        d.flag = true
                                    }
                                });
                                d.bufferData.push({
                                    'flag': true,
                                    'is_read': 0
                                })
                                d.postData = d.bufferData.concat(d.postData);
                                d.bufferData = [];
                            }, 0);
                        }
                    }
                });
            });
            // }
            //console.log($scope.monitorData);
            angular.element(doms).find(".loads").slideUp("slow");
            // $timeout(function(){
            //         angular.element(doms).find(".addnums").slideUp("slow");
            // }, 4000);
        }, function(error) {
            angular.element(doms).find(".loads").slideUp("slow");
            // angular.element(doms).find(".addnums").slideUp("slow");
            console.log(error);
        });
    };
    $scope.showMore = function(topicId) {
        $scope.monitorData.forEach(function(d) {
            if (d.topicId == topicId) {
                if (!d.isLoad) {} else {
                    console.log(topicId);
                    console.log('show more triggered');
                    var cons = {};
                    cons.dataType = $scope.dataType;
                    cons.siteId = $scope.siteId;
                    cons.date = $scope.date;
                    cons.pageCount = 20;
                    cons.topicId = topicId;
                    $scope.monitorData.forEach(function(d) {
                        console.log(d);
                        if (d.topicId == topicId) {
                            cons.oldTime = d.oldTime;
                        }
                    });
                    angular.element("#topic_" + topicId).find(".loadsMore").slideDown("slow");
                    //console.log(angular.element("#topic_" + topicId).find(".loadsMore"));
                    MonitorFacService.getLoadData(cons).then(function(res) {
                        angular.element("#topic_" + topicId).find(".loadsMore").slideUp("slow");
                        console.log(res[0]);
                        $scope.monitorData.forEach(function(d) {
                            if (res[0].topicId == d.topicId) {
                                d.oldTime = res[0].oldTime;
                                if (res[0].postData.length == 0) {
                                    d.isLoad = false;
                                } else {
                                    res[0].postData.forEach(function(mm) {
                                        d.postData.push(mm);
                                    });
                                }
                            }
                        });
                    }, function(error) {
                        console.log(error);
                    });
                }
            }
        });
    };
    $scope.panelCollapse = function(topic_id) {
        var doms = "#topic_" + topic_id;
        angular.element(doms).find(".panel-body").slideToggle();
    };
    $scope.pauseTop = function(topic_id) {
        console.log(topic_id);
        $scope.topic_id = "topic_" + topic_id;
        $scope.monitortopic_id = "monitortopic_" + topic_id;
        ngDialog.open({
            template: '/static/modules/monitor/pages/pauseTopic.html',
            controller: 'pauseTopic',
            width: "10%",
            scope: $scope
        });
    };

    $scope.startTop = function(topic_id) {
        $scope.topic_id = "topic_" + topic_id;
        $scope.monitortopic_id = "monitortopic_" + topic_id;
        ngDialog.open({
            template: '/static/modules/monitor/pages/startTopic.html',
            controller: 'startTopic',
            width: "10%",
            scope: $scope
        });
    };
    $scope.AddSenmessage = function(post_id, site_id) {
        console.log(post_id);
        $scope.post_id = post_id;
        $scope.site_id = site_id;
        ngDialog.open({
            template: '/static/modules/monitor/pages/addsenmessage.html',
            controller: 'addSenmessage',
            appendClassName: "ngdialog-theme-enginesetting",
            width: "100%",
            scope: $scope
        });
    };
    // $scope.SetTopic = function() {
    //     console.log("set Topic");
    //     ngDialog.open({
    //         template: '/static/modules/monitor/pages/manageTopic.html',
    //         controller: 'manageTopicController',
    //         appendClassName: "ngdialog-theme-enginesetting",
    //         width: "100%",
    //         scope: $scope
    //     });
    // };

    // $scope.ShowSenAnalys = function(topic_id){
    //     // console.log(topic_id);
    //     $scope.topic_id = topic_id;
    //     ngDialog.open({
    //         template:'/static/modules/monitor/pages/topicAnalys.html',
    //         controller:'sentopicAnalysController',
    //         appendClassName: "ngdialog-theme-enginesetting",
    //         width:'100%',
    //         scope:$scope
    //     });
    // };
    $scope.MarkRead = function(post_id) {
        // console.log($(this).find(".save").find("img").remove());
        // $("#"+post_id+"").find(".save").find("img").remove()
        // $("#"+post_id+"").find(".save").prepend("<img src = '/static/assets/img/saved.svg'>");
    };
    $scope.OpenAnaly = function(analy_topic, topic_id) {
        var anaDom = "#" + analy_topic;
        var topicDom = "#topic_" + topic_id;
        angular.element(topicDom).after(angular.element(anaDom));
        angular.element(anaDom).removeClass("hidden").show("normal");
        var width = angular.element(topicDom).width();
        // time
        var timeAna = c3.generate({
            bindto: "#timeAna",
            size: {
                width: width * 0.8
            },
            padding: {
                top: 20,
                left: 40,
                right: 30,
                bottom: 20
            },
            data: {
                x: 'x',
                columns: [
                    ['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05'],
                    ['时间', 30, 200, 100, 400, 150]
                ]
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d'
                    }
                }
            }
        });
    };
    $scope.stopAnaly = function(analy_topic) {
        var anaDom = "#" + analy_topic;
        angular.element(anaDom).hide("slow");
    };
    $scope.addBg = function($event) {
        //console.log($event.target);
        var tt = $event.target;
        if (angular.element(tt.closest("li")).hasClass("monitor-bg-color") == false) {
            angular.element(tt.closest("li")).addClass("monitor-bg-color");
            angular.element(tt.closest("li")).find(".iconslists").removeClass("ng-hide");
        }
    };
    $scope.removeBg = function($event) {
        var tt = $event.target;
        if (angular.element(tt.closest("li")).hasClass("monitor-bg-color")) {
            angular.element(tt.closest("li")).removeClass("monitor-bg-color");
            angular.element(tt.closest("li")).find(".iconslists").addClass("ng-hide");
        }
    };
    $scope.openModal = function(topicId) {
        $state.go("sentopicAnalysController", {
            topicId: topicId
        });
    };
    $scope.topic_id = null;
        //页面UI初始化；
        $scope.$on('$viewContentLoaded', function() {
            if($rootScope.mainController) {
                $scope.userId = 1;
                $scope.baseUrl = CQ.variable.RESTFUL_URL ;
                var url = $scope.baseUrl+"/settopic";
                //?userId=" + $scope.userId;
                // var url = "/static/setup.json";
                var sites = "";
                $scope.page = 0;
                $http.get(url).success(function(data){
                    console.log(data);
                    data.data.topicData.forEach(function(d){
                        sites = "";
                        d.siteLists.forEach(function(site){
                            if(sites != "")
                            {
                                sites += ",";
                            }
                            if(site.siteName)
                            {
                                sites += site.siteName;
                            }
                        });
                        d.sitesStr = sites;
                    });
                    $scope.topicList = data.data.topicData;
                    $scope.topicCount = $scope.topicList.length;
                    $scope.allsites = data.data.allSites;
                    // $scope.getDataByPage($scope.page);
                });
                console.log("userSetting app start!!!");
                App.runui();
            }
        });

        $scope.onDragComplete = function($data,$event)
        {

        };

        $scope.onDropComplete = function($data,$event)
        {
            for(var i = 0; i < $scope.allsites.length; i++)
            {
                for(var j = 0; j < $scope.allsites[i].detail_sites.length; j++)
                {
                    if($scope.allsites[i].detail_sites[j].siteId == $data.siteId)
                    {
                        if($scope.allsites[i].detail_sites[j].selected)
                        {
                            return;
                        }
                        else
                        {
                            $scope.allsites[i].detail_sites[j].selected = true;
                            $scope.topic.siteLists.push($data);
                            return;
                        }
                    }
                }
            }
        };
        //拖动全选
        $scope.onAllDrag = function($data,$event)
        {
            //$event.stopPropagation();
            for(var i = 0; i < $scope.allsites.length; i++)
            {
                if($scope.allsites[i].siteTypeId ==$data.siteTypeId)
                {
                    $scope.allsites[i].selected = true;
                    $scope.allsites[i].detail_sites.forEach(function(d1){
                        d1.selected = $scope.allsites[i].selected;
                        $scope.checkBoxChange(d1);
                    });
                    return;
                }
            }
        };

        //全选
        $scope.onAllSelected = function(d)
        {
            d.detail_sites.forEach(function(d1){
                d1.selected = d.selected;
                $scope.checkBoxChange(d1);
            });
        }
        //删除话题
        $scope.remove = function(d)
        {
          // console.log("test==============",d);
            $scope.topic_id = d.topicId;

            ngDialog.open(
            {
                template: '/static/modules/monitor/pages/deleteMyTopic.html',
                controller: 'deleteMyTopic',
                width:"10%",
                scope:$scope,
                // closePromise.then(function(){
                //   window.location.reload("index.html#/monitor/-1/-1");
                // })
            });
        };
        $scope.toggle = function (scope) {
            scope.toggle();
        };
        //修改、添加话题
        $scope.save = function()
        {
            console.log($scope.topic);
            $scope.jsonData = {};
            $scope.jsonData.userId = $scope.userId;
            // if($scope.topic.topicId)
            //     $scope.jsonData.topicId = $scope.topic.topicId;
            $scope.jsonData.topicName = $scope.topic.topicName;
            // $scope.topic.topicKeywords._and = $scope.topic.topicKeywords.and.toString().split(',');
            // $scope.topic.topicKeywords._or = $scope.topic.topicKeywords.or.toString().split(',');
            $scope.jsonData.topicKeywords = $scope.topic.topicKeywords;
            for(var i = 0; i < $scope.topic.topicKeywords.length; i++)
            {
                $scope.topic.topicKeywords[i] = $scope.topic.topicKeywords[i].str.split(',');
            }
            console.log($scope.topic.topicKeywords);
            $scope.jsonData.sites = $scope.topic.siteLists;
            $scope.jsonData = JSON.stringify($scope.jsonData);
            console.log($scope.jsonData);
            $http({
                url: $scope.submitUrl,
                method: 'post',
                data: $scope.jsonData,
            }).success(function(data, status, headers, config){
                if(data.success == false) {
                    //alert("操作失败!即将为您跳转...");
                    notice.notify_info("您好！", "操作失败，请重试！" ,"",false,"","");
                }
                else if(data.success == true){
                  // setTimeout(function(){
                  //     window.location.reload("index.html#/monitor/-1/-1");
                  // },2000);
                    notice.notify_info("您好！", "话题操作成功！" ,"",false,"","");
                    if(!!data.data)
                    {
                        console.log("ZYZ");
                        console.log(JSON.stringfy(data))
                        $scope.topic.topicId = data.data.topic_id;
                        console.log($scope.topic);
                    }
                    $scope.reload($scope.topic,"save");
                }

            })
            .error(function(){
                //alert("未知的错误!即将为您跳转...");
                notice.notify_info("您好！", "服务器出错！！" ,"",false,"","");
            });
        }
        $scope.openBatchPage = function()
        {
            ngDialog.open(
            {
                template: '/static/modules/monitor/pages/batchKeywords.html',
                controller: 'batchKeywords',
                appendClassName: "ngdialog-theme-form",
                width: "100%",
                scope: $scope
            }
            );
        }
        //添加与关键词组
        $scope.addAndKeywords = function()
        {
            var andKeywords = [];
            $scope.topic.topicKeywords.push(andKeywords);
            console.log($scope.topic.topicKeywords);
        }
        //删除与关键词组
        $scope.delAndKeywords = function(i)
        {
            $scope.topic.topicKeywords.splice(i,1);
        }
        //关键词显示
        $scope.toStr = function(kw)
        {
            if(!(kw instanceof Array))
            {
                return console.error("kw is not a array");
            }
            var result = kw[0].toString();
            for(var i = 1; i < kw.length; i++)
            {
                result += ";" + kw[i].toString();
            }
            return result;
        }
        //添加话题
        $scope.newTopic = function()
        {
            $scope.modelName = "添加话题";
            $scope.topic = {topicName:"",topicKeywords:[],siteLists:[]};
            $scope.topic.topicKeywords.push([]);
            $scope.allsites.forEach(function(d1)
            {
                d1.selected = false;
                d1.detail_sites.forEach(function(d){
                    d.selected = false;
                });
            });
            console.log($scope.topic);
            $scope.topicNameEnable = false;
            $scope.submitUrl  = $scope.baseUrl + "/addtopic";
        }
        //选择站点
        $scope.checkBoxChange = function(d,typesite)
        {
            if(typesite)
            {
                update(typesite);
            }
            if(d.selected)
            {
                for(var index = 0; index < $scope.topic.siteLists.length; index++)
                {
                    if($scope.topic.siteLists[index].siteId == d.siteId)
                        return;
                }
                $scope.topic.siteLists.push({"siteId":d.siteId,"siteName":d.siteName});
            }
            else
            {
                for(var index = 0; index < $scope.topic.siteLists.length; index++)
                {
                    if($scope.topic.siteLists[index].siteId == d.siteId)
                        $scope.topic.siteLists.splice(index, 1);
                }
            }
            // console.log($scope.topic.siteLists);
        }
        function update(d)
        {
            d.selected = true;
            for(var i = 0; i < d.detail_sites.length; i++)
            {
                d.selected = (d.selected && d.detail_sites[i].selected);
            }
        }
        //刷新
        $scope.reload = function(d,opretion)
        {
            if(opretion == "save" && $scope.modelName == "添加话题")
            {
                d.siteLists = d.siteLists || [];
                d.sitesStr = d.siteLists.map(d=>d.siteName).join(',');
                // var con = {"topicId":d.topicId,"topicName"}
                $scope.topicList.push(d);
                $scope.monitorData.push(d);
                $("#myModal").modal('hide');
                return true;
            }
            else if(opretion == "save" && $scope.modelName == "修改话题")
            {
                d.siteLists = d.siteLists || [];
                d.sitesStr = d.siteLists.map(d=>d.siteName).join(',');
                for(var i = 0; i < $scope.topicList.length; i++)
                {
                    if($scope.topicList[i].topicName == d.topicName)
                    {
                       $scope.topicList[i] = d;
                       // $scope.pageData[i%$scope.pageSize] = d;
                       $("#myModal").modal('hide');
                       return true;
                   }
               }
           }
           else if(opretion == "delete")
           {
                for(var i = 0; i < $scope.monitorData.length; i++)
                {
                    if($scope.monitorData[i].topicId == d)
                    {
                        $scope.monitorData.splice(i,1);
                    }
                }
                for(var i = 0; i < $scope.topicList.length; i++)
                {
                    if($scope.topicList[i].topicId == d)
                    {
                        $scope.topicList.splice(i,1);
                        return true;
                    }
                }
            }
            return false;
        }
        //修改话题
        $scope.changeTopic = function(d)
        {
            $scope.modelName = "修改话题";
            $scope.topicNameEnable = true;
            // $scope.topic = JSON.parse(JSON.stringify(d)) || {};
            for(var i = 0; i < $scope.topicList.length; i++)
            {
                if($scope.topicList[i].topicId==d.topicId){
                  $scope.topic = $scope.topicList[i];

                }
            }
            for(var i = 0; i < $scope.topic.topicKeywords.length; i++)
            {
                $scope.topic.topicKeywords[i].str = $scope.topic.topicKeywords[i].toString();
            }
                    // console.log(new d.constructor());
                    $scope.submitUrl = $scope.baseUrl + "/modifytopic";
                    // $scope.submitUrl = "http://118.190.133.203:8100/yqdata/modifytopic";
                    $scope.allsites.forEach(function(d3){
                        d3.selected = false;
                        d3.detail_sites.forEach(function(d1)
                        {
                            d1.selected = false;
                            $scope.topic.siteLists.forEach(function(d2){
                                if(d2.siteId == d1.siteId)
                                {
                                    d1.selected = true;
                                }
                            });
                        });
                        update(d3);
                    });
        };
}]).controller("openTopic", ["$rootScope", "$scope", "ngDialog", function($rootScope, $scope, ngDialog) {
    console.log("openTopic", "start!!!");
}]).controller("pauseTopic", ["$rootScope", "$scope", "ngDialog", function($rootScope, $scope, ngDialog) {
    console.log("pauseTopic", "start!!!");
    console.log($scope.topic_id);
    $scope.stopTopic = function() {
        if ($scope.topic_id) {
            $("#" + $scope.topic_id + "").hide("slow");
            $("#" + $scope.monitortopic_id + " a:first-child").addClass("disabled");
            $("#" + $scope.monitortopic_id + " .start").removeClass("hidden");
            $("#" + $scope.monitortopic_id + " .stop").addClass("hidden");
        }
        ngDialog.closeAll();
    };
}]).controller("startTopic", ["$rootScope", "$scope", "ngDialog", function($rootScope, $scope, ngDialog) {
    console.log("startTopic", "start!!!");
    console.log($scope.topic_id);
    $scope.starTopic = function() {
        if ($scope.topic_id) {
            var ht = $("#" + $scope.topic_id + "");
            $("#topicLists").prepend(ht);
            $("#" + $scope.topic_id + "").fadeIn("slow");
            $("#" + $scope.monitortopic_id + " a:first-child").removeClass("disabled");
            $("#" + $scope.monitortopic_id + " .start").addClass("hidden");
            $("#" + $scope.monitortopic_id + " .stop").removeClass("hidden");
        }
        ngDialog.closeAll();
    };
}]).controller("sentopicAnalysController", ["$rootScope", "$scope", "$http", "$stateParams", "TopicFacService_", "SearchFacService", "$state",
    function($rootScope, $scope, $http, $stateParams, TopicFacService_, SearchFacService, $state) {
        console.log("topicAnalys", "start!!!");
        console.log($stateParams.topicId);
        $scope.topic_id = $stateParams.topicId;
        $scope.senpostData = null;
        $scope.topicName = "";
        $scope.backTopic = false;
        $scope.filters = {
            "start_time": "",
            "site": [],
            "topicIds": [],
            "end_time": "",
            "filter": "",
            "filtertype": 0
        };
        // console.log("1223123")
        // getTopicData();
        getTopicAnalysData();
        $scope.userId = 1;
        var params = {
            userId: $scope.userId
        };
        SearchFacService.getRuleData(params).then(function(data) {
            $scope.allSites = data.allSites;
            if (!$scope.senpostData) {
                $("#load").show();
            }
        });
        // $scope.openModal = function(){
        //     $state.go("topicController");
        // };
        // function getTopicData() {
        //     var cons = {};
        //     cons.userId = 1;
        //     TopicFacService.getTopicData(cons).then(function(res){
        //         console.log(res);
        //         var imgs2 = ["/static/assets/img/1.jpg","/static/assets/img/2.jpg","/static/assets/img/3.jpg"];
        //         var imgs3 = ["/static/assets/img/ky1.jpg","/static/assets/img/ky2.jpg","/static/assets/img/ky3.jpg"];
        //         var imgs4 = ["/static/assets/img/gk1.jpg","/static/assets/img/gk2.jpg","/static/assets/img/gk3.jpg"];
        //         var imgs9 = ["/static/assets/img/da1.jpg","/static/assets/img/da2.jpg","/static/assets/img/da3.jpg"];
        //         var imgs12 = ["/static/assets/img/zbqc1.jpg","/static/assets/img/zbqc2.jpg","/static/assets/img/zbqc3.jpg"];
        //         var imgs8 = ["/static/assets/img/8-1.jpg","/static/assets/img/8-2.jpg","/static/assets/img/8-3.jpg","/static/assets/img/8-4.jpg"];
        //         var imgs99 = ["/static/assets/img/9-1.jpg","/static/assets/img/9-2.jpg","/static/assets/img/9-3.jpg"];
        //         res.forEach(function(d) {
        //             var limitLen = 40;
        //             try{
        //                 if(d.summary.length > limitLen)
        //                 {
        //                     d.summary = d.summary.substring(0,limitLen) + "...";
        //                 }
        //             }
        //             catch(err)
        //             {
        //                 console.log(err);
        //             }
        //             if(d.topicId == 2) {
        //                 d.imgs = imgs9;
        //             }else if(d.topicId == 1) {
        //                 d.imgs = imgs4;
        //                 // d.summary = "各大高校研究生复试工作正在进行，大多数高校已经录取结束";
        //             }else if(d.topicId == 0) {
        //                 d.imgs = imgs2;
        //             }else if(d.topicId == 3) {
        //                 d.imgs = imgs12;
        //             }else if(d.topicId == 9) {
        //                 d.imgs = imgs99;
        //             }else if(d.topicId == 8) {
        //                 d.imgs = imgs8;
        //             }else if(d.topicId > 4) {
        //                 // d.summary = "各个地方成人高考报名工作开始";
        //                 d.imgs = imgs2;
        //             }
        //             //d.imgs = imgs;
        //         });
        //         var topicWeight={"十九大":100,"高考":90,"成考":80,"作弊":70};
        //         res.sort(function(a,b){
        //             return topicWeight[b.topicName]-topicWeight[a.topicName]>0?1:-1;
        //         });
        //         $scope.data = res;
        //         setTimeout(function(){
        //             $scope.$apply(function(){
        //                 drawClouds();
        //             });
        //         }, 1000);
        //
        //
        //     },function(error) {
        //         console.log(error);
        //     });
        // };
        function getTopicAnalysData() {
            var cons = {};
            cons.userId = 1;
            cons.topicId = $scope.topic_id;
            // console.log(cons.topicId)
            $scope.filters.topicIds.push(+$scope.topic_id);
            TopicFacService_.getTopicAnalyData(cons).then(function(res) {
                if (res.topicId != $scope.topic_id) {
                    return;
                }
                // $scope.imgs = res.imgs;
                // console.log(res);
                // var imgs2 = ["/static/assets/img/1.jpg","/static/assets/img/2.jpg","/static/assets/img/3.jpg"];
                // var imgs3 = ["/static/assets/img/ky1.jpg","/static/assets/img/ky2.jpg","/static/assets/img/ky3.jpg"];
                // var imgs4 = ["/static/assets/img/gk1.jpg","/static/assets/img/gk2.jpg","/static/assets/img/gk3.jpg"];
                // var imgs9 = ["/static/assets/img/da1.jpg","/static/assets/img/da2.jpg","/static/assets/img/da3.jpg"];
                // var imgs12 = ["/static/assets/img/zbqc1.jpg","/static/assets/img/zbqc2.jpg","/static/assets/img/zbqc3.jpg"];
                // var imgs8 = ["/static/assets/img/8-1.jpg","/static/assets/img/8-2.jpg","/static/assets/img/8-3.jpg","/static/assets/img/8-4.jpg"];
                // var imgs99 = ["/static/assets/img/9-1.jpg","/static/assets/img/9-2.jpg","/static/assets/img/9-3.jpg"];
                //
                //     if(res.topicId == 2) {
                //         $scope.imgs = imgs9;
                //     }else if(res.topicId == 1) {
                //         $scope.imgs = imgs4;
                //         // d.summary = "各大高校研究生复试工作正在进行，大多数高校已经录取结束";
                //     }else if(res.topicId == 0) {
                //         $scope.imgs = imgs2;
                //     }else if(res.topicId == 3) {
                //         $scope.imgs = imgs12;
                // if(res.topicId == 9)
                //     $scope.imgs = imgs99;
                //     }else if(res.topicId == 8) {
                //         $scope.imgs = imgs8;
                //     }else if(res.topicId > 4) {
                //         // d.summary = "各个地方成人高考报名工作开始";
                //         $scope.imgs = imgs2;
                //     }
                //d.imgs = imgs;
                $scope.topicName = res.topicName;
                $scope.senpostData = res.postData;
                $scope.topic_kws = res.topic_kws;
                $scope.backTopic = true;
                $scope.senTopicEvolu = res.topic_info;
                drawEchart();
                drawChart(true);
                $scope.imgs = [];
                res.imgs.forEach(url => {
                    var img = new Image();
                    img.src = url;
                    img.onload = function() {
                        $scope.imgs.push(img.src);
                        console.log(img.src);
                        // var imgs99 = ["/static/assets/img/9-1.jpg","/static/assets/img/9-2.jpg","/static/assets/img/9-3.jpg"];
                        //
                        //     if(res.topicId == 2) {
                        //         $scope.imgs = imgs9;
                        //     }else if(res.topicId == 1) {
                        //         $scope.imgs = imgs4;
                        //         // d.summary = "各大高校研究生复试工作正在进行，大多数高校已经录取结束";
                        //     }else if(res.topicId == 0) {
                        //         $scope.imgs = imgs2;
                        //     }else if(res.topicId == 3) {
                        //         $scope.imgs = imgs12;
                        // if(res.topicId == 9)
                        //     $scope.imgs = imgs99;
                    }
                    img.onerror = function() {
                        console.log(url + " is not found!!!");
                    }
                });
                $(".loading").hide();
            }, function(error) {
                console.log(error);
                $("#load").hide();
            });
        }
        $scope.redraw = function() {
            console.log("resize!!!!!!");
            try {
                drawChart(false);
            } catch (err) {
                console.log(err);
            }
        }

        function drawEchart() {
            var times = []
            var keys = [];
            var dat = []
            for (var i = 0; i < 10; i++) {
                dat[i] = [0, 0, 0, 0, 0, 0, 0]
            }
            $scope.senTopicEvolu.forEach(function(d) {
                var sentime = d.time.slice(0, 10);
                if (times.indexOf(sentime) < 0) times.push(sentime);
                if (keys.indexOf(d.word) < 0) {
                    keys.push(d.word);
                }
                if (d.number > 0) {
                    dat[keys.indexOf(d.word)][times.indexOf(sentime)] = Math.log(d.number);
                } else {
                    dat[keys.indexOf(d.word)][times.indexOf(sentime)] = d.number;
                }
            })
            times = times.reverse();
            for (var i = 0; i < dat.length; i++) {
                dat[i] = dat[i].reverse();
            }
            console.log('times', times);
            console.log('keys:', keys);
            // $scope.senTopicEvolu.forEach(function (v,d) {
            //     // console.log('v:',v,'d:',d);
            //     for(var i=0;i<keys.length;i++){
            //         var tmp = keys[i];
            //         if(v.topic.hasOwnProperty(tmp)) {
            //             // console.log(v.topic,tmp)
            //             dat[i][d] = +v.topic[tmp];
            //         }
            //     }
            // })
            console.log(dat);
            var sencolor = ['#a6cee3', '#fdbf6f', '#b2df8a', '#1f78b4', '#33a02c', '#6a3d9a', '#e31a1c', '#ff7f00', '#cab2d6', '#fb9a99']
            var myChart = echarts.init(document.getElementById('senTopicEvolu'));
            var option = {
                legend: {
                    data: keys
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: times.reverse(),
                    name: '时间',
                    nameLocation: 'end',
                }],
                yAxis: [{
                    type: 'value',
                    name: '词频数',
                }],
                series: []
            }
            for (var i = 0; i < keys.length; i++) {
                var tmp = {
                    name: keys[i],
                    type: 'line',
                    stack: '总量',
                    itemStyle: {
                        normal: {
                            color: sencolor[i]
                        }
                    },
                    areaStyle: {
                        normal: {}
                    },
                    data: dat[i]
                }
                option.series.push(tmp)
            }
            myChart.setOption(option);
        }

        function drawChart(first) {
            if (first) {
                var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
                $scope.senpostData.forEach(function(d) {
                    d.postTime = dateFormat.parse(d.postTime);
                });
            }
            var ndx = crossfilter($scope.senpostData);
            var datatypeDist = dc.pieChart("#datatypeDist");
            var datatypeDim = ndx.dimension(function(d) {
                return d.dataTypeName;
            });
            var datatypeGroup = datatypeDim.group();
            var siteDist = dc.rowChart("#siteDist");
            var siteDim = ndx.dimension(function(d) {
                return d.site_name;
            });
            var siteGroup = siteDim.group();
            // linechart1 and linechart2
            var dayDist1 = dc.lineChart('#dayDist1');
            var dayDim1 = ndx.dimension(function(d) {
                var min_time = new Date($scope.senpostData[$scope.senpostData.length - 1].postTime),
                    max_time = new Date($scope.senpostData[0].postTime),
                    months = max_time.getMonth() - min_time.getMonth() < 0 ? max_time.getMonth() - min_time.getMonth() + 12 : max_time.getMonth() - min_time.getMonth(),
                    days = Math.abs(max_time.getDate() - min_time.getDate());
                var postTime = new Date(d.postTime),
                    year = postTime.getFullYear(),
                    month = postTime.getMonth() < 10 ? '0' + postTime.getMonth() : postTime.getMonth(),
                    day = postTime.getDate() < 10 ? '0' + postTime.getDate() : postTime.getDate(),
                    hour = postTime.getHours() < 10 ? '0' + postTime.getHours() : postTime.getHours(),
                    minute = postTime.getMinutes() < 10 ? '0' + postTime.getMinutes() : postTime.getMinutes(),
                    second = postTime.getSeconds() < 10 ? '0' + postTime.getSeconds() : postTime.getSeconds();
                var ret = postTime;
                if (months > 0) {
                    ret = year + '-' + month + '-' + day;
                } else if (days > 7) {
                    ret = year + '-' + month + '-' + day + ' ' + hour + ':00:00';
                } else if (days > 1) {
                    ret = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':00';
                } else {
                    ret = d.postTime;
                }
                d.postTime = new Date(ret);
                return d.postTime;
                // return d.postTime;
            });
            var dayGroup1 = dayDim1.group();
            drawdatatypeDist(datatypeDist, datatypeDim, datatypeGroup);
            drawsiteDist(siteDist, siteDim, siteGroup);
            // draw sitedist
            drawdayDist1(dayDist1, dayDim1, dayGroup1);
            drawClouds();
        }

        function drawdatatypeDist(datatypeDist, datatypeDim, datatypeGroup) {
            var width = $("#datatypeDist").width() * 0.9,
                height = $("#datatypeDist").height() * 0.9,
                sum = datatypeDim.groupAll().value();
            datatypeDist.width(width).height(height).innerRadius(20).dimension(datatypeDim).group(datatypeGroup).legend(dc.legend().legendText(function(d) {
                return d.name + ' ' + (d.data / sum * 100).toFixed(2) + '%';
            }));
            // datatypeDist.addFilterHandler(function(filters, filter) {
            //     filters.push(filter);
            //     $scope.filters.site = filters;
            //     $scope.filters.filter = filter;
            //     $scope.filters.filtertype = 1;
            //     return filters;
            // });
            datatypeDist.addFilterHandler(function(filters, filter) {
                filters.push(filter);
                $scope.filters.filter = filter;
                $scope.filters.filtertype = 1;
                return filters;
            });
            datatypeDist.render();
            // console.log(d3.selectAll('text.pie-slice'));
            // d3.selectAll('text.pie-slice').text(function(d) {
            //             if(d.endAngle != d.startAngle)
            //                 return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
            //         });
        }
        $scope.selectGraphPost = function() {
            var params = {};
            var format = function(date) {
                var datetime = new Date(date);
                // year = datetime.getFullYear(),
                // month = datetime.getMonth() + 1,
                // day = datetime.getdate();
                // if(month<=9){
                //     month="0"+month;
                // }
                // if(day<=9){
                //     day="0"+date;
                // }
                // return year+"-"+month+"-"+day;
            }
            // var start_time = format($scope.filters.start_time);
            var siteIds = [];
            if ($scope.filters.filtertype == 1) //点击数据源分布图
            {
                for (var i = 0; i < $scope.allSites.length; i++) {
                    if ($scope.filters.filter == $scope.allSites[i].dataTypeName) {
                        if ($scope.filters.site.length == 0) {
                            siteIds.push($scope.allSites[i].dataTypeId);
                            break;
                        }
                        for (var j = 0; j < $scope.filters.site.length; j++) {
                            for (var k = 0; k < $scope.allSites[i].detail_sites.length; k++) {
                                if ($scope.allSites[i].detail_sites[k].siteName == $scope.filters.site[j]) {
                                    siteIds.push($scope.allSites[i].detail_sites[k].siteId);
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
                console.log(siteIds);
            } else if ($scope.filters.filtertype == 2) //点击具体站点分布图
            {
                for (var i = 0; i < $scope.allSites.length; i++) {
                    for (var j = 0; j < $scope.allSites[i].detail_sites.length; j++) {
                        console.log($scope.filters.filter);
                        if ($scope.allSites[i].detail_sites[j].siteName = $scope.filters.filter) {
                            siteIds.push($scope.allSites[i].detail_sites[j].siteId + 10);
                            break;
                        }
                    }
                    break;
                }
            }
            params.sites = siteIds;
            params.topicIds = $scope.filters.topicIds;
            params.start_time = $scope.filters.start_time;
            params.end_time = $scope.filters.end_time;
            console.log(params);
            $state.go("yuqingTrendsController", params);
        }

        function drawsiteDist(siteDist, siteDim, siteGroup) {
            var width = $("#siteDist").width() * 0.9,
                height = $("#siteDist").height() * 0.9;
            siteDist.data = function() {
                var top10 = siteGroup.top(10);
                return top10;
            };
            siteDist.width(width).height(height).dimension(siteDim).group(siteGroup).x(d3.scale.linear().domain([6, 20])).margins({
                    top: 0,
                    right: 30,
                    bottom: 20,
                    left: 10
                }).label(function(d) {
                    return d.key + ":" + d.value;
                }).renderTitle(true)
                // .on('pretransition', function(chart) {
                //     chart.select("svg > g")
                //     .attr("transform", "translate(" + 10 + "," + -20 + ")");
                //     chart.select("svg").append("text")
                //     .attr("transform", "translate(" + (width/2) + "," + (height - 20 - 20 + 28) + ")")
                //     .style("text-anchor", "middle")
                //     .text("帖子数量");
                // })
                .controlsUseVisibility(true).elasticX(true);
            siteDist.addFilterHandler(function(filters, filter) {
                filters.push(filter);
                $scope.filters.site = filters;
                $scope.filters.filter = filter;
                $scope.filters.filtertype = 2;
                return filters;
            });
            siteDist.render();
            // d3.select("#siteDist svg > g")
            //     .attr("transform", "translate(" + 10 + "," + -20 + ")");
            // d3.select("#siteDist svg").append("text")
            //     .attr("transform", "translate(" + (width/2) + "," + (height - 20 - 20 + 28) + ")")
            //     .style("text-anchor", "middle")
            //     .text("帖子数量");
        }

        function drawdayDist1(dayDist1, dayDim1, dayGroup1, ndx) {
            function drawElasticxDayDist() {
                var x1 = new Date(dayDim1.top(1)[0].postTime),
                    x2 = new Date(dayDim1.bottom(1)[0].postTime),
                    months = x1.getMonth() - x2.getMonth() < 0 ? x1.getMonth() - x2.getMonth() + 12 : x1.getMonth() - x2.getMonth(),
                    days = Math.abs(x1.getDate() - x2.getDate());
                var dayDim = ndx.dimension(d => {
                    var date = new Date(d.postTime),
                        year = date.getFullYear(),
                        month = date.getMonth(),
                        day = date.getDate(),
                        week = data.get
                    if (months > 3) //按月显示
                    {} else if (months > 0) //按星期显示
                    {} else if (days > 0) //按天显示
                    {} else //按时间显示
                    {}
                });
                console.log(x1);
                console.log(x2);
            }
            var reDraw = function() {
                // console.log(data);
                dayDist1.data = function() {
                    var ticks = 15,
                        data = dayDim1.top(Infinity).reverse(),
                        x1 = new Date(data[0].postTime),
                        x2 = new Date(data[data.length - 1].postTime),
                        timeRange = ~~((x2.getTime() - x1.getTime()) / ticks / 2),
                        startTime = x1,
                        midTime = new Date(startTime.getTime() + timeRange),
                        endTime = new Date(startTime.getTime() + timeRange * 2),
                        count = 0;
                    // console.log(dayDim1.top(Infinity));
                    data = data.reduce((acc, d) => {
                        count += 1;
                        // console.log(acc);
                        if (new Date(d.postTime) >= endTime || new Date(d.postTime) >= x2) {
                            acc.push({
                                key: startTime,
                                value: count
                            });
                            startTime = endTime;
                            midTime = new Date(startTime.getTime() + timeRange);
                            endTime = new Date(startTime.getTime() + timeRange * 2);
                            count = 0;
                        }
                        return acc;
                    }, []);
                    return data
                };
                // dayDist1
                //     .renderArea(true)
                //     .width(width)
                //     .height(height)
                //     .transitionDuration(1000)
                //     .margins({top: 30, right: 50, bottom: 25, left: 40})
                //     .dimension(dayDim1)
                //     .group(dayGroup1)
                //     .mouseZoomable(true)
                //     .rangeChart(dayDist2)
                //     .title(function(p){
                //         return [
                //             "时间: "+dateFormat(p.key),
                //             "数目: "+p.value
                //         ].join("\n");
                //     })
                //     .x(d3.time.scale().domain([$scope.senpostData[$scope.senpostData.length - 1].postTime,
                //         $scope.senpostData[0].postTime]))
                //     .round(d3.time.minute.round)
                //     .xUnits(d3.time.minutes)
                //     // .elasticY(true)
                //     // .elasticX(true)
                //     .renderHorizontalGridLines(true)
                //     .brushOn(false)
                //     .xAxisLabel("时间")
                //     .yAxisLabel("帖子数量");
                // dayDist1.render();
            }
            // console.log(dayGroup1.top(Infinity));
            var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
            var dayDist2 = dc.barChart("#dayDist2");
            var dayDim2 = dayDim1;
            var dayGroup2 = dayDim2.group().reduceSum(function(d) {
                return 0.2;
            });
            var width = $("#dayDist1").width();
            var height = $("#dayDist1").height();
            dayDist1.renderArea(true).width(width).height(height).transitionDuration(1000).margins({
                    top: 30,
                    right: 50,
                    bottom: 25,
                    left: 40
                }).dimension(dayDim1).group(dayGroup1).mouseZoomable(true).rangeChart(dayDist2).title(function(p) {
                    return ["时间: " + dateFormat(p.key), "数目: " + p.value].join("\n");
                }).x(d3.time.scale().domain([$scope.senpostData[$scope.senpostData.length - 1].postTime,
                    $scope.senpostData[0].postTime
                ])).round(d3.time.hours.round)
                // .x(dc.)
                .xUnits(d3.time.hours).elasticY(true)
                // .elasticX(true)
                .renderHorizontalGridLines(true).brushOn(false).xAxisLabel("时间").yAxisLabel("帖子数量");
            dayDist1.render();
            // var defaultredraw = dayDist1.redraw;
            // dayDist1.redraw = function(){
            //     reDraw();
            //     defaultredraw();
            // };
            // line2
            dayDist2.width($("#dayDist2").width()).height(100).margins({
                    top: 30,
                    right: 50,
                    bottom: 25,
                    left: 40
                }).dimension(dayDim2).group(dayGroup2).elasticY(false).yAxisPadding('10%') //设置y轴距离顶部的距离(为了renderLabel才设置)
                .centerBar(true).gap(1)
                // .round(d3.time.month.round)
                .alwaysUseRounding(true)
                // .xUnits(d3.time.month)
                .renderLabel(false).outerPadding(0.2).controlsUseVisibility(true).x(d3.time.scale().domain([$scope.senpostData[$scope.senpostData.length - 1].postTime,
                    $scope.senpostData[0].postTime
                ])).renderHorizontalGridLines(false).brushOn(true);
            dayDist2.addFilterHandler(function(filters, filter) {
                filters.push(filter);
                $scope.filters.start_time = filter[0];
                $scope.filters.end_time = filter[1];
                console.log($scope.filters.start_time);
                console.log($scope.filters.end_time);
                // $scope.filters.filtertype = 3;
                return filters;
            });
            dayDist2.render();
            $("#dayDist2 .y").html("");
            $("#dayDist2 .y").remove();
        }

        function drawClouds() {
            var doms = "wordsCloud_" + $scope.topic_id;
            var topicKeywords = {};
            $scope.topic_kws.forEach(d => {
                // if(!topicKeywords[d.word])
                //     topicKeywords[d.word] = 0 ;
                topicKeywords[d.word] = (topicKeywords[d.word] || 0) + d.weight;
            });
            $scope.topic_kws = Object.keys(topicKeywords).map(key => {
                return {
                    word: key,
                    weight: topicKeywords[key]
                };
            });
            // console.log($scope.topic_kws);
            // var topicwords = Object.keys($scope.topic_kws);
            if (document.getElementById(doms) != undefined) {
                //console.log("aaa");
                var chart = echarts.init(document.getElementById(doms));
                var color = d3.scale.category10();
                var i = 0;
                var options = {
                    series: [{
                        type: 'wordCloud',
                        gridSize: 1,
                        size: ['100%', '100%'],
                        autoSize: {
                            enable: true,
                            minSize: 0
                        },
                        sizeRange: [30, 80],
                        rotationRange: [0, 45],
                        shape: 'circle',
                        textStyle: {
                            normal: {
                                color: function() {
                                    return color(i++);
                                }
                            },
                            emphasis: {
                                shadowBlur: 10,
                                shadowColor: '#333'
                            }
                        },
                        data: []
                    }]
                };
                var keylists = [];
                // console.log("key-values",$scope.topic_kws[topicwords[0]]);
                for (var i = 0; i < $scope.topic_kws.length; i++) {
                    var tt = {};
                    tt.name = $scope.topic_kws[i].word;
                    tt.value = $scope.topic_kws[i].weight;
                    keylists.push(tt);
                };
                options.series[0].data = keylists;
                chart.setOption(options);
                var searchPost = function(param) {
                    $state.go("yuqingTrendsController", {
                        "keywords": [keylists[param.dataIndex].name],
                        "topicIds": [$scope.topic_id]
                    });
                }
                chart.on("click", searchPost);
            };
        }
    }
])
.controller("deleteMyTopic", ["$rootScope", "$scope", "$http", "ngDialog", "notice",function($rootScope, $scope,
    $http, ngDialog, notice) {
    console.log("delete topic");
    $scope.deleteMyTopic = function() {
        $scope.removeUrl = $scope.baseUrl + "/deletetopic";
        $http({
            params: {topicId : $scope.topic_id},
            //url:"http://118.190.133.203:8100/yqdata/deletetopic",
            url: $scope.removeUrl,
            method: 'get',
        })
        .success(function(data, status, headers, config){
            // window.location.reload("index.html#/monitor/-1/-1");
            ngDialog.closeAll();
            notice.notify_info("您好！","话题删除成功！","",false,"","");
            $scope.reload($scope.topic_id,"delete");
            })
        .error(function(error){
            notice.notify_info("您好！", "操作失败，请重试！" ,"",false,"","");
        });
    };
}])
.controller("batchKeywords", ["$scope",function($scope) {
    console.log("batchKeywords");
    $scope.must_keywords = {"keywords":"","info":"关键词组1","error":{"null":"不能为空","pattern":"关键词之间需以英文,隔开"}};
    $scope.should_keywords = {"keywords":"","info":"关键词组2","error":{"null":"不能为空","pattern":"关键词之间需以英文,隔开"}};
    $scope.combination = function()
    {
        var keywords1 = $scope.must_keywords.keywords.split(","),
        keywords2 = $scope.should_keywords.keywords.split(",");
        for(var i = 0; i < keywords1.length; i++)
        {
            for(var j = 0; j < keywords2.length; j++)
            {
                var newKeywords = [keywords1[i],keywords2[j]];
                newKeywords.str = newKeywords.toString();
                $scope.topic.topicKeywords.push(newKeywords);
            }
        }
        $scope.closeThisDialog();
    }
}])
.controller("addSenmessage", ["$rootScope", "$scope", "ngDialog", "MonitorFacService", "PostDataService_", "notice",
    function($rootScope, $scope, ngDialog, MonitorFacService, PostDataService_, notice) {
        console.log("addSenmessage", "start!!!");
        //console.log($scope.post_id);
        $scope.detailData = null;
        $scope.addsenword = function() {
            var range = window.getSelection() || document.getSelection() || document.selection.createRange();
            var word = range.toString().trim();
            if (word != '') {
                if ($scope.detailData.senwords == '' || $scope.detailData.senwords == null) {
                    $scope.detailData.senwords = word;
                } else {
                    $scope.detailData.senwords += ',' + word;
                }
            }
        }
        $scope.DoaddSen = function() {
            if ($scope.detailData.senwords && $scope.detailData.senwords.split) {
                $scope.detailData.senwords = $scope.detailData.senwords.split(',');
            } else {
                $scope.detailData.senwords = [];
            }
            console.log("$scope.detailData");
            console.log($scope.detailData);
            var cons = {};
            cons.userId = 1;
            var postData = [];
            postData.push($scope.detailData);
            cons.postData = postData;
            PostDataService_.addSenMessage(cons).then(function(res) {
                console.log(res);
                ngDialog.closeAll();
                notice.notify_info("您好", "添加成功！", "", false, "", "");
            }, function(err) {
                console.log(err);
                notice.notify_info("您好", "添加失败！请重试", "", false, "", "");
            });
        };
        MonitorFacService.getPostDetail({
            id: $scope.post_id,
            site_id: $scope.site_id
        }).then(function(res) {
            console.log(res);
            $scope.detailData = res[0];
            $scope.detailData.content = $scope.detailData.content.trim();
            $scope.detailData.title = $scope.detailData.title.trim();
        }, function(err) {
            notice.notify_info("您好", "添加失败！请重试", "", false, "", "");
            //ngDialog.closeAll();
            console.log(err);
        });
    }
]);
