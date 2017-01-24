/**
 * Created by zhangshiping on 2017/1/8.
 */
(function(window){'use strict';
    //定义模块名称
    var MODULE_NAME = 'multilevelMove';

    //所有定义指令
    var directive = {};

    /**
     * 多级联动
     * @type {*[]}
     */
    directive.multilevelMove = ['$parse', '$animate', '$compile','tree', function($parse, $animate, $compile,tree) {
        //默认配置
        var config = {
            show : 'name', //多级联动显示字段
            value : 'id', //多级联动显示值
            childrens_key : 'childrens', //子节点字段键
            element_name : '', //表单节点名称,用于非ajax表单提交数据
            label : [], //每一个下拉菜单的左侧说明
            empty : [], //当没有选择值时的提示
            margin_tree : false, //是否为数据库表结构数据
            primary_key : 'id', //主键
            parent_key : 'parent_id', //父级字段
            selected : false //是否默认选中第一个值
        };

        //数据获取KEY
        var dataKey = fengtingxun.getDirectiveName('multilevelMove');

        //配置数据获取KEY
        var configKey = fengtingxun.getDirectiveName('multilevelMoveConfig');

        return {
            restrict: 'A', //属性
            //templateUrl : '/bower_components/angular-fengtingxun/src/directives/multilevel-move.html',
            scope:{data:'='+dataKey,config:'='+configKey,area:'=ngModel'},
            template:'<div>'+
                       '<span ng-repeat="(key,value) in seleceLength">'+
                       '    <label>{{main_config[\'label\'][key]}}</label>'+
                       '    <select name="{{main_config[\'element_name\'] ? main_config[\'element_name\']+\'[]\' : \'\'}}" ng-model="area[key]" ng-change="change(area[key],key)" >'+
                       '        <option ng-if="main_config[\'empty\'] !==false" value="">{{main_config[\'empty\'][key] || \'请选择\'}}</option>'+
                       '        <option ng-repeat="x in value" value="{{x[main_config[\'value\']]}}">{{x[main_config[\'show\']]}}</option>'+
                       '    </select>'+
                       '</span>' +
                    '</div>',
            replace:true,
            link: function (scope,element, attr) {
                //现在使用配置
                scope.main_config = fengtingxun.overCinfig(config,scope.config);

                //不需要未选择提示时,将设置为自动选择第一个值
                if(scope.main_config['empty']===false){
                    scope.main_config['selected'] = true;
                }

                //选中值
                scope.area = typeof scope.area == "object" ? scope.area : [];

                for (var i in scope.area){
                    scope.area[i] = scope.area[i]+''; //类型转换
                }

                //监听数据源改变
                scope.$watch('data', function (value) {

                    //获取数据
                    var datas = angular.copy(value);

                    //非树状结构转换树状结构
                    if(scope.main_config['margin_tree']){
                        datas = tree.toTree(datas,scope.main_config['primary_key'],scope.main_config['parent_key'], scope.main_config['childrens_key']);
                    }

                    //将主键设置成key标记
                    scope.datas =  tree.keyBy(datas,scope.main_config['value'],scope.main_config['childrens_key']);

                    //默认选中第一个
                    if(scope.main_config['selected'] && !scope.area.length){
                        scope.area = tree.treeFirst(scope.datas,scope.main_config['value'],scope.main_config['childrens_key']);
                    }

                    //默认显示第一级
                    scope.seleceLength = [scope.datas];
                    //循环显示后面层级
                    for (var i=0;i<scope.area.length;i++){
                        if(typeof scope.seleceLength[i]=='undefined' || typeof scope.seleceLength[i]['id_'+scope.area[i]]=='undefined'){
                            scope.seleceLength.splice(i,scope.seleceLength.length-i);
                            scope.area.splice(i,scope.area.length-i);
                            break;
                        }
                        if(typeof scope.seleceLength[i]['id_'+scope.area[i]][scope.main_config['childrens_key']]!='undefined'){
                            scope.seleceLength[i+1] = scope.seleceLength[i]['id_'+scope.area[i]][scope.main_config['childrens_key']];
                        }
                    }
                });

                /**
                 * 改变值方法
                 * @param value 选择的值
                 * @param select_index 第几个select
                 */
                scope.change = function(value,select_index){

                    //数据源
                    var datas = scope.seleceLength[select_index];

                    //选择存在子节点,添加子节点选项
                    if(typeof datas['id_'+value]=='object' && typeof datas['id_'+value][scope.main_config['childrens_key']]=="object"){
                        //下一级select的数据
                        scope.seleceLength[select_index+1] = datas['id_'+value][scope.main_config['childrens_key']];
                        //如果设置了默认选择
                        if(scope.main_config['empty']===false){
                            scope.area = scope.area.concat(tree.treeFirst(scope.seleceLength[select_index+1],scope.main_config['value'],scope.main_config['childrens_key']));
                        }
                        //不存在子节点,删除子节点选项
                    }else {
                        //删除后面的select
                        scope.seleceLength.splice(select_index+1,scope.seleceLength.length-(select_index+1));
                        //删除后面的无效选择
                        scope.area.splice(select_index+1,scope.area.length-(select_index+1));
                    }
                };
            }
        };
    }];
    var init = function(angular,fengtingxun){
        //应用模块创建
        var app =  angular.module(fengtingxun.getTrueModule('directives.'+MODULE_NAME,fengtingxun.config.moduleName),fengtingxun.getTrueModules([
            'services.tree' //树状服务
        ]));

        /**
         * 注册自定义命令
         */
        app.directive(fengtingxun.getTrueDirectives(directive));
    };
    if ( typeof define === "function" && define.amd && typeof requirejs === "function" ) {
        define(['angular','fengtingxun',fengtingxun.getTrueModule('services.tree',fengtingxun.config.moduleName)],function(angular,fengtingxun){
            init(angular,fengtingxun);
        });
    }else {
        init(window.angular,window.fengtingxun);
    }

})(window);