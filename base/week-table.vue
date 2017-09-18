<template>
    <div :class="classes">
        <div @click="handleClick(cell)" :class=getCellCls(cell) v-for="(cell, index) in cells" class='one-week'>
            <span style='width: 50px;padding-left: 10px'>第{{cell.count}}周</span><span style='width: 145px'>{{cell.firstDayOfWeekLabel}}~{{cell.endDayOfWeekLabel}}</span>
        </div>
    </div>
</template>
<script>
    import {getFirstDayOfMonth, getDayCountOfMonth } from '../util';
    import { deepCopy } from '../../date-picker/utils/assist';
    import Locale from '../../date-picker/mixins/locale';
    import moment from '../../../../node_modules/moment';
    moment.locale('zh-cn');

    const prefixCls = 'ivu-date-picker-cells';

    const clearHours = function (time) {
        const cloneDate = new Date(time);
        cloneDate.setHours(0, 0, 0, 0);
        return cloneDate.getTime();
    };

    export default {
        mixins: [ Locale ],
        props: {
            date: {},
            year: {},
            month: {},
            selectionMode: {
                default: 'week'
            },
            disabledDate: {},
            value: ''
        },
        data () {
            return {
                prefixCls: prefixCls
            };
        },
        computed: {
            classes () {
                return [
                    `${prefixCls}`
                ];
            },
            cells () {
                let cellsArray=[];
                const date = new Date(this.year, this.month, 1);
                const disabledDate=this.disabledDate;
                var firstDay = moment(date,'YYYY-MM-DD').startOf('month'),//这个月的第一天
                    monthDay = getFirstDayOfMonth(date),//这个月的第一天在当前周的第几天
                    month = firstDay.format('MM'),//当前月份
                    week,count = 1, nowDate;
                //今天的日期或者是指定的value值
                if(this.value.length){
                    let valArr=this.value.split('~');
                    nowDate=clearHours(new Date(valArr[0]));
                }else{
                    nowDate=clearHours(new Date());
                }
                if(monthDay !== "1"){
                    week = moment(firstDay.format('YYYY-MM-DD'),'YYYY-MM-DD').add('day',7-monthDay+1);
                }else{
                    week = moment(firstDay.format('YYYY-MM-DD'),'YYYY-MM-DD');
                }
                //循环本月的几个周
                while(week.startOf('week').format('MM') === month){
                    var cell={};
                    cell.count=count;
                    cell.firstDayOfWeek=week.startOf('week').format('YYYY-MM-DD');
                    cell.firstDayOfWeekLabel=week.startOf('week').format('MM-DD');
                    cell.endDayOfWeek=week.endOf('week').format('YYYY-MM-DD');
                    cell.endDayOfWeekLabel=week.endOf('week').format('MM-DD');
                    const time=clearHours(cell.firstDayOfWeek);
                    cell.disabled=typeof disabledDate === 'function' && disabledDate(new Date(time));
                    if(nowDate===clearHours(cell.endDayOfWeek)||nowDate===clearHours(cell.firstDayOfWeek)||nowDate>clearHours(cell.firstDayOfWeek)&&nowDate<clearHours(cell.endDayOfWeek)){
                        cell.selected=true;
                    }else{
                        cell.selected=false;
                    }
                    week = week.add('day',7);
                    cellsArray.push(cell);
                    count++;
                }
                return cellsArray;
            }
        },
        methods: {
            handleClick (cell) {
                debugger;
                const target = event.target;
                if (target.tagName === 'SPAN') {
                    cell.selected=true;
                    //把选中的周传给week.vue
                    this.$emit('on-pick', cell.firstDayOfWeek+'~'+cell.endDayOfWeek);
                }
                this.$emit('on-pick-click');
            },
            getCellCls (cell) {
                return [
                    {
                        [`one-week-selected`]: cell.selected,
                        [`one-week-disabled`]: cell.disabled,
                        [`one-week-range`]: !cell.disabled&&!cell.selected
                    }
                ];
            }
        }
    };
</script>
<style>
    .one-week{
        border-radius: 3px;
        line-height: 35px;
        text-align: center;
    }
    /*不选择 不disabled时才有hover效果*/
    .one-week-range:hover{
        background: #e1f0fe;
        cursor: pointer;
    }
    .one-week-selected{
        background:#2d8cf0;
        color:#fff;
    }
    .one-week-disabled{
        cursor: not-allowed;
        background: #f7f7f7;
        color: #bbbec4;
    }
    /*selected 但是 disabled 时 背景置灰*/
    .one-week-disabled.one-week-selected{
        background: #bbbec4;
        color: #f7f7f7;
    }
</style>
