"use strict";
CQ.mainApp.guideController
    .controller('guideController', ['$scope', '$rootScope', '$http', "GuideFacService", "ngDialog", "notice", function($scope, $rootScope, $http, GuideFacService, ngDialog, notice) {
      console.log("guideController started");
      $scope.events = [];
      $scope.selectList = [];
      $scope.eventName = "请您选择舆情事件";
      $scope.eventDetail = "";
      $http({
        method:"get",
        url:"/static/assets/data/events.json",
      }).then(res => {
        $scope.events = res.data;
        console.log(res);
      });
      // GuideFacService.getEventData().then(res => {
      //   console.log(res);
      // });
      $scope.selectEvent = function (i) {
        console.log($scope.events[i].event);
        // GuideFacService.getAspectData({"event_id": $scope.events[i].event_id, "count": "3"}).then(res => {
        //   console.log(res);
        // });
        $scope.eventName = $scope.events[i].event;
        $scope.eventDetail = $scope.events[i].desc;
      };
      $scope.ensure = function () {
        $("#modal-dialog").removeClass("in");
        $("#modal-dialog").css("display", "none");
        $("#wizard ol li:nth-child(2)").trigger("click");
      };
      $scope.aspects = [{
          "aspect_id": 1,
          "event_id":1,
          "name": "司机",
          "sentiment": [111, 20, 70],
          "text": ["2018年，特朗普政府不顾中方劝阻，执意发动贸易战，掀起了又一轮的中美贸易争端。中美贸易争端，也叫中美贸易战，是中美经济关系中的重要问题。贸易争端主要发生在两个方面：一是中国比较具有优势的出口领域；二是中国没有优势的进口和技术知识领域。前者基本上是竞争性的，而后者是市场不完全起作用的，它们对两国经济福利和长期发展的影响是不同的。","2018年，特朗普政府不顾中方劝阻，执意发动贸易战，掀起了又一轮的中美贸易争端。中美贸易争端，也叫中美贸易战，是中美经济关系中的重要问题。贸易争端主要发生在两个方面：一是中国比较具有优势的出口领域；二是中国没有优势的进口和技术知识领域。前者基本上是竞争性的，而后是市场不完全起作用的，它们对两国经济福利和长期发展的影响是不同的。"]
        },
        {
          "aspect_id": 2,
          "event_id":1,
          "name": "乘客",
          "sentiment": [111, 20, 70],
          "text": ["2018年，特朗普政府不顾中方，执意发动贸易战，掀起了又一轮的中美贸易争端。中美贸易争端，也叫中美贸易战，是中美经济关系中的重要问题。贸易争端主要发生在两个方面：一是中国比较具有优势的出口领域；二是中国没有优势的进口和技术知识领域。前者基本上是竞争性的，而后者是市场不完全起作用的，它们对两国经济福利和长期发展的影响是不同的。","2018年，特朗普政府不顾中方劝阻，执意发动贸易战，掀起了又一轮的中美贸易争端。中美贸易争端，也叫中美贸易战，是中美经济关系中的重要问题。贸易争端主要发生在两个方面：一是中国比较具有优势的出口领域；二是中国没有优势的进口和技术知识领域。前者基本上是竞争性的而后者是市场不完全起作用的，它们对两国经济福利和长期发展的影响是不同的。"]
        }
      ];
      $scope.selectAspect = function(item) {
        if(item.selected) {
          $scope.selectList.push(item);
        } else {
          let idx = $scope.selectList.findIndex((value, index, arr) => {
            return value.aspect_id == item.aspect_id;
          });
          $scope.selectList.splice(idx, 1);
        }
        console.log($scope.selectList);
      };
      
      const option = {
        legend: {},
        tooltip: {},
        dataset: {
            source: [
                ['图例', '正向', '中立', '负向'],
                ['aspect1', 111, 20, 70],
                ['aspect2', 111, 20, 70]
            ]
        },
        xAxis: {type: 'category'},
        yAxis: {},
        // Declare several bar series, each will be mapped
        // to a column of dataset.source by default.
        series: [
            {type: 'bar'},
            {type: 'bar'},
            {type: 'bar'}
        ]
      };
      // myChart.showLoading();
      // myChart.setOption(option, true);
      let myChart;
      $scope.$watch('selectList', function() {
        if($scope.selectList.length) {
          if (myChart != null && myChart != "" && myChart != undefined) {
            myChart.dispose(); //销毁
          }
          option.dataset.source = [['图例', '正向', '中立', '负向']];
          $scope.selectList.forEach(item => {
            option.dataset.source.push([item.name, ...item.sentiment]);
          });
          setTimeout(() => {
            myChart = echarts.init(document.getElementById('live-updated-chart'));
            myChart.setOption(option, true);
          }, 0);
        }
      }, true);

      // $scope.emotionAnalyse = function() {
      //   if (myChart != null && myChart != "" && myChart != undefined) {
      //     myChart.dispose(); //销毁
      //   }
      //   myChart = echarts.init(document.getElementById('live-updated-chart'));
      //   console.log(myChart);
      //   option.dataset.source = [['图例', '正向', '中立', '负向']];
      //   $scope.selectList.forEach(item => {
      //     option.dataset.source.push([item.name, ...item.sentiment]);
      //   });
      //   console.log(option);
      //   myChart.setOption(option, true);
      //   // setTimeout(() => {
      //   //   myChart.setOption(option, true);
      //   // }, 0);
      // }

      $scope.genText = function() {
        if($scope.eventName == "请您选择舆情事件") {
          notice.notify_info("请您选择舆情事件!");
          $("#wizard ol li:nth-child(1)").trigger("click");
        } else {
          ngDialog.open({
              template: '/static/modules/guide/pages/genText.html',
              controller: 'textController',
              appendClassName: "ngdialog-theme-details",
              width: "100%",
              scope: $scope
          });
        };
      };
    }])
    .controller('textController', ['$scope', '$rootScope', '$http', "ngDialog", "notice", function($scope, $rootScope, $http, ngDialog, notice) {
      console.log("textController started");
      $scope.genText = [1, 2, 3];
    }]);