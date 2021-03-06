var obj_NgApp = angular.module('app_checklist', ['ngRateIt', 'ui.bootstrap']);

obj_NgApp.controller('ctr_checklist', function ($scope, $http, $document, $window) {

    var baseUrl = '/checklist';

    $scope.sharedDObj = {};
    $scope.sharedDObj.total_cnt = 0;
    $scope.sharedDObj.curPage = 1;
    $scope.maxPaginationPerPage = 5;
    $scope.perPage = 5;

    $scope.pageChanged = function() {
        $scope.cancleClick();
        searchHanlder();
    }

    $scope.completeBool = true;

    $scope.editViewBool = false;

    $scope.selectedBadge = '';

    $document.ready(function () {

        $( ".date_picker" ).datepicker({
            defaultDate: "",
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1,
            dateFormat    : "yy-mm-dd"
        });

        $scope.searchClick();
    });

    function formattedDate(date) {

        //ISO Date로 전환(달, 일자를 2자리 수로 고정하기 위해)
        var isoDate = date.toISOString();

        //정규 표현식으로 변환(MM/DD/YYYY)
        //result = isoDate.replace(/^(\d{4})\-(\d{2})\-(\d{2}).*$/, '$2/$3/$1');
        result = isoDate.replace(/^(\d{4})\-(\d{2})\-(\d{2}).*$/, '$1-$2-$3');
        return result;
    }

    function subtractDate(date, sub) {
        //sub 값이 있을 경우(빼기)
        if (sub != undefined) {
            date.setDate(date.getDate() - sub);
        }
        return date;
    }

    $scope.prevClick = function() {
        $scope.cancleClick();
        $scope.curPage = $scope.curPage - 1;
        searchHanlder();
    }

    $scope.searchClick = function (searchTag) {

        $scope.selectedBadge = searchTag;

        $scope.cancleClick();
        if(searchTag == undefined) {
            $scope.searchTag = 'All';
        } else {
            $scope.searchTag = searchTag;
        }
        $scope.curPage = 1;
        searchHanlder();
    }

    $scope.completeClick = function () {
        var ctrUrl = baseUrl + '/complete';

        var dataObj = returnSearchCriteria();
        addDataObj(jQuery, dataObj, "sel_id", $scope.sel_id);

        $http.post(ctrUrl, dataObj).success(function (returnData) {
            $scope.cancleClick();
            searchResultHandler(returnData);
        }).error(function (data, status, headers, config) {
            alert('error: ' + status);
        });

    }

    $scope.cancelCompletionClick = function () {
        var ctrUrl = baseUrl + '/cancelComplete';

        var dataObj = returnSearchCriteria();
        addDataObj(jQuery, dataObj, "sel_id", $scope.sel_id);

        $http.post(ctrUrl, dataObj).success(function (returnData) {
            $scope.cancleClick();
            searchResultHandler(returnData);
        }).error(function (data, status, headers, config) {
            alert('error: ' + status);
        });

    }

    function returnSearchCriteria() {
        var dataObj = {};
        addDataObj(jQuery, dataObj, "searchText", $scope.searchText);
        if($scope.searchTag != 'All') {
            addDataObj(jQuery, dataObj, "searchTags", $scope.searchTag);
        }
        addDataObj(jQuery, dataObj, "completeYn", $scope.completeBool == true ? 'n' : 'y');
        addDataObj(jQuery, dataObj, "pageNo", $scope.sharedDObj.curPage);
        return dataObj;
    }

    function searchResultHandler(returnData) {
        $scope.test_cols = returnData.test_cols;
        $scope.keywords = returnData.keywords;
        $scope.sharedDObj.total_cnt = returnData.total_cnt;
    }

    function searchHanlder() {
        var ctrUrl = baseUrl + '/search';

        $http.post(ctrUrl, returnSearchCriteria()).success(function (returnData) {
            searchResultHandler(returnData);

        }).error(function (data, status, headers, config) {
            alert('error: ' + status);
        });
    }

    $scope.searchDetailHanlder = function(idx) {
        var ctrUrl = baseUrl + '/searchDetail';
        var dataObj = {};
        addDataObj(jQuery, dataObj, "chklst_id", $scope.test_cols[idx]._id);

        $http.post(ctrUrl, dataObj).success(function (returnData) {
            $scope.chklstDtl = returnData.chklstDtl;

        }).error(function (data, status, headers, config) {
            alert('error: ' + status);
        });
    }

    $scope.nextClick = function () {
        $scope.cancleClick();
        if ($scope.test_cols.length == 0) {
            alert('There is no more page.')
        } else {
            $scope.curPage = $scope.curPage + 1;
            searchHanlder();
        }
    }

    $scope.newPostClick = function () {
        $scope.editViewBool = true;
        $scope.sel_title = '';
        $scope.sel_tags = '';
        $scope.sel_rating = 0;
        $scope.sel_id = '';
        $scope.sel_start_date = formattedDate(subtractDate(new Date(), 0));

        $scope.sel_interval_val = "";
        $scope.sel_interval_unit = "";

        $scope.chklstDtl = {};

        $scope.isItNew = true;
    }

    $scope.completeChklst = function(idx, dueDate, desc) {

        var ctrUrl = baseUrl + '/chklstDone';
        var dataObj = {};
        addDataObj(jQuery, dataObj, "sel_id", $scope.sel_id);
        addDataObj(jQuery, dataObj, "dtl_id", $scope.chklstDtl[idx]._id);

        addDataObj(jQuery, dataObj, "sel_due_date", dueDate);
        addDataObj(jQuery, dataObj, "sel_desc", desc);
        addDataObj(jQuery, dataObj, "sel_interval_val", $scope.sel_interval_val);
        addDataObj(jQuery, dataObj, "sel_interval_unit", $scope.sel_interval_unit);

        $http.post(ctrUrl, dataObj).success(function (returnData) {
            $scope.chklstDtl = returnData.chklstDtl;

        }).error(function (data, status, headers, config) {
            alert('error: ' + status);
        });

    }

    $scope.rowClick = function (idx) {
        if ($scope.editViewBool == true && $scope.selInx == idx) {
            $scope.editViewBool = false;

        } else {
            $scope.isItNew = false;

            $scope.editViewBool = true;
            $scope.selInx = idx;
            $scope.sel_title = $scope.test_cols[idx].title;
            $scope.sel_tags = $scope.test_cols[idx].tags;
            $scope.sel_rating = $scope.test_cols[idx].rating;
            $scope.sel_id = $scope.test_cols[idx]._id;
            $scope.sel_notice_bool = $scope.test_cols[idx].notice_bool;
            $scope.sel_start_date = $scope.test_cols[idx].start_date;

            $scope.sel_interval_val = $scope.test_cols[idx].interval_val;
            $scope.sel_interval_unit = $scope.test_cols[idx].interval_unit;

            if($scope.test_cols[idx].complete == 'y') {
                $scope.completeButtonBool = false;
            } else {
                $scope.completeButtonBool = true;
            }

            $scope.searchDetailHanlder($scope.selInx);
        }
    }

    $scope.cancleClick = function () {
        $scope.editViewBool = false;
    }

    function addDataObj(jQuery, dataObj, keyNm, keyVal) {
        eval("jQuery.extend(dataObj, {" + keyNm + " : keyVal})");
    }

});
