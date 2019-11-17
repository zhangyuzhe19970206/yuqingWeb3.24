"use strict";
CQ.mainApp.guideController
  .controller('guideController', ['$scope', '$rootScope', '$http', "GuideFacService", "ngDialog", "notice", function ($scope, $rootScope, $http, GuideFacService, ngDialog, notice) {
    console.log("guideController started");
    $scope.events = [];
    $scope.selectList = [];
    $scope.dataType = new DataType();
    $scope.eventName = "请您选择舆情事件";
    $scope.aspects = [];
    $scope.text = [];
    $scope.eventId = 0;
    GuideFacService.getEventData().then(res => {
      console.log(res);
      $scope.events = res;
    });
    function DataType() {
      DataType.prototype.choice_aspects = "";
      DataType.prototype.choice_way = "";
    }
    // 两种写法都可以
    // DataType.prototype.chioce_aspects = "";
    // DataType.prototype.chioce_way = "";

    function drawClouds() {
      var color = d3.scale.category10();
      var i = 0;
      var options = {
        series: [{
          type: 'wordCloud',
          gridSize: 1,
          sizeRange: [12, 45],
          rotationRange: [0, 45],
          shape: 'circle',
          textStyle: {
            normal: {
              color: function () {
                return color(i++);
              },
              fontFamily: 'italic',
            },
            // emphasis: {
            //     shadowBlur: 15,
            //     shadowColor: '#333'
            // }
          },
          data: []
        }]
      };
      const optionBar = {
        legend: {},
        tooltip: {},
        dataset: {
          source: [
            ['图例', '正向', '中立', '负向'],
          ]
        },
        xAxis: { type: 'category' },
        yAxis: {},
        series: [
          { type: 'bar' },
          { type: 'bar' },
          { type: 'bar' }
        ]
      };
      $scope.aspect_id_list.forEach((id, index) => {
        var doms = `wordsCloud_${index}`;
        var domsBar = `bar_${index}`;
        if (document.getElementById(doms)) {
          var chart = echarts.init(document.getElementById(doms));
          var keylists = [];
          let data = $scope.aspects.filter(item => item.aspect_id == id);
          console.log(data);
          $scope.aspects.filter(item => item.aspect_id == id)[0].word_cloud.forEach(function (d) {
            var tt = {};
            tt.name = d.word;
            tt.value = d.weight;
            keylists.push(tt);
          });
          console.log(keylists);
          options.series[0].data = keylists;
          chart.setOption(options);
        }
        if (document.getElementById(domsBar)) {
          var chartBar = echarts.init(document.getElementById(domsBar));
          var keylists = [];
          let data = $scope.aspects.filter(item => item.aspect_id == id)[0];
          optionBar.dataset.source = [['图例', '正向', '中立', '负向']];
          optionBar.dataset.source.push([data.name, ...data.sentiment]);
          chartBar.setOption(optionBar);
        }
      });
    }

    $scope.selectEvent = function (i) {
      // $("#modal-dialog").addClass("in");
      console.log($scope.events[i].name);
      $scope.eventName = $scope.events[i].name;
      $scope.eventId = $scope.events[i].event_id;
      console.log(document.querySelector(`.gallery .gallery-group-1:nth-child(${i + 1}) > a`));
      // $(`.gallery .gallery-group-1:nth-child(${i + 1}) > a`).trigger("click");
    };
    $scope.ensure = function () {
      $("#modal-dialog").css("display", "none");
      $("#modal-dialog").removeClass("in");

      $("body").removeClass("modal-open");
      $("#modal-dialog").attr("aria-hidden", "true");
      $scope.aspects = [];
      $scope.selectList = [];
      $scope.text = [];
      $("#wizard ol li:nth-child(2)").trigger("click");
      GuideFacService.getAspectData({ "event_id": $scope.eventId, "count": "3" }).then(res => {
        console.log(res);
        $scope.aspects = res;
      });
    };
    $scope.selectAspect = function (item) {
      if (item.selected) {
        $scope.selectList.push(item);
      } else {
        let idx = $scope.selectList.findIndex((value, index, arr) => {
          return value.aspect_id == item.aspect_id;
        });
        $scope.selectList.splice(idx, 1);
      }
      $scope.aspect_id_list = $scope.selectList.map(item => "" + item.aspect_id);
      console.log($scope.aspect_id_list);
    };

    $scope.$watch('selectList', function () {
      // if ($scope.selectList.length) {
      //   if (myChart != null && myChart != "" && myChart != undefined) {
      //     myChart.dispose(); //销毁
      //   }
      //   option.dataset.source = [['图例', '正向', '中立', '负向']];
      //   $scope.selectList.forEach(item => {
      //     option.dataset.source.push([item.name, ...item.sentiment]);
      //   });
      //   setTimeout(() => {
      //     myChart = echarts.init(document.getElementById('live-updated-chart'));
      //     myChart.setOption(option, true);
      //     drawClouds();
      //   }, 0);
      // }
      setTimeout(() => {
        drawClouds();
      }, 1);
    }, true);

    $scope.genText = function () {
      if ($scope.eventName == "请您选择舆情事件") {
        notice.notify_info("请您选择舆情事件!");
        $("#wizard ol li:nth-child(1)").trigger("click");
      } else {
        const { choice_way, choice_aspects } = $scope.dataType;
        if (choice_way && choice_aspects) {
          GuideFacService.getTextGenerate({ "direction": choice_way, "aspect_id": choice_aspects }).then(res => {
            console.log(res);
            $scope.text = res.text.map(item => ({ "txt": item }));
          });
        } else {
          notice.notify_info("补全选项!");
        }
      };
    };

    $scope.guideAspect = function(item) {
      console.log(item);
      $("#wizard ol li:nth-child(3)").trigger("click");
      $scope.dataType.choice_aspects = item.aspect_id;
      $scope.dataType.choice_way = "1";
      GuideFacService.getTextGenerate({ "direction": "1", "aspect_id": item.aspect_id }).then(res => {
        console.log(res);
        $scope.text = res.text.map(item => ({ "txt": item }));
      });
    }

    $scope.gotoWeibo = function() {
      window.open('https://weibo.com/u/7330074104');
    }

    $scope.ensureMethod = function (i, item) {
      console.log(item);
      let operate = [];
      let { txt, first, second } = item;
      if (first && first.selected) {
        operate.push(1);
      }
      if (second && second.selected) {
        operate.push(2);
      }
      console.log(operate.join(","));
      if (!operate.length) {
        notice.notify_info("请选择引导策略!");
      } else {
        GuideFacService.postText({
          text: txt,
          operate: operate.join(",")
        }).then(res => {
          console.log(res);
          if (res.status === 200) {
            notice.notify_info("微博发布成功，请前往个人主页查看!");
            $scope[`weibo${i}`] = true;
          } else {
            notice.notify_info("出现错误!");
          }
        });
      }
    };
  }])
    // .controller('textController', ['$scope', '$rootScope', '$http', "ngDialog", "notice", function($scope, $rootScope, $http, ngDialog, notice) {
    //   console.log("textController started");
    //   $scope.genText = [1, 2, 3];
    //   console.log($scope.aspect_id_list);
    //   if($scope.aspect_id_list.length) {
    //     getTextGenerate({"aspect_id":"1,2"})
    //   }
    // }]);