<template>
    <div :class="classes" @click="handleClick" @mousemove="handleMouseMove">
        <span :class="getCellCls(cell)" v-for="(cell, index) in readCells"><em :index="index">{{ tCell(cell.text) }}</em></span>
    </div>
</template>
<script>
    import { deepCopy } from '../../date-picker/utils/assist';
    import Locale from '../../date-picker/mixins/locale';
    const prefixCls = 'ivu-date-picker-cells';
    //参照date-table里的方法写的
    const clearMonth = function (time) {
        const cloneDate = new Date(time);
        cloneDate.setDate(1);
        cloneDate.setHours(0, 0, 0, 0);
        return cloneDate.getTime();
    };
    export default {
        mixins: [ Locale ],
        props: {
            date: {},
            year:{},
            month: {},
            disabledDate: {},
            selectionMode: {
                default: 'range'
            },
            minDate: {},
            maxDate: {},
            rangeState: {
                default () {
                    return {
                        endDate: null,
                        selecting: false
                    };
                }
            },
            value: ''
        },
        data () {
            return {
                prefixCls: prefixCls,
                readCells: [],
            };
        },
        computed: {
            classes () {
               return [
                   `${prefixCls}`,
                   `${prefixCls}-month`
                ];
            },
            cells () {
                const selectMonth = clearMonth(new Date(this.value));    // timestamp of selected day
                const minMonth = clearMonth(new Date(this.minDate));
                const maxMonth = clearMonth(new Date(this.maxDate));
                const curMonth = clearMonth(new Date());

                let cells = [];
                const cell_tmpl = {
                    text: '',
                    type: '', // today,normal
                    selected: false,
                    disabled: false,// 不可选则的
                    range: false,
                    start: false,
                    end: false
                };

                for (let i = 0; i < 12; i++) {
                    const cell = deepCopy(cell_tmpl);
                    //循环中的当前月
                    const month = clearMonth(new Date(this.year, i));

                    const date = new Date(this.date);
                    date.setMonth(i);

                    cell.type = curMonth === month ? 'today' : 'normal';
                    cell.text = i + 1;
                    cell.selected = month === selectMonth;
                    cell.disabled = typeof this.disabledDate === 'function' && this.disabledDate(date)  && this.selectionMode === 'range';
                    cell.range = month >= minMonth && month <= maxMonth;
                    cell.start = this.minDate && month === minMonth;
                    cell.end = this.maxDate && month === maxMonth;
                    cells.push(cell);
                }
                return cells;
            }
        },
        watch:{
            'rangeState.endDate' (newVal) {
                this.markRange(newVal);
            },
            minDate(newVal, oldVal) {
                if (newVal && !oldVal) {
                    this.rangeState.selecting = true;
                    this.markRange(newVal);
                } else if (!newVal) {
                    this.rangeState.selecting = false;
                    this.markRange(newVal);
                } else {
                    this.markRange();
                }
            },
            maxDate(newVal, oldVal) {
                if (newVal && !oldVal) {
                    this.rangeState.selecting = false;
                    this.markRange(newVal);
                }
            },
            cells: {
                handler (cells) {
                    this.readCells = cells;
                },
                immediate: true
            }
        },
        methods: {
            getCellCls (cell) {
                return [
                    `${prefixCls}-cell`,
                    {
                        [`${prefixCls}-cell-selected`]: cell.selected|| cell.start || cell.end,
                        [`${prefixCls}-cell-disabled`]: cell.disabled,
                        [`${prefixCls}-cell-today`]: cell.type === 'today',
                        [`${prefixCls}-cell-range`]: cell.range && !cell.start && !cell.end
                    }
                ];
            },
            handleClick (event) {
                const target = event.target;
                if (target.tagName === 'EM') {
                    const index = parseInt(event.target.getAttribute('index'));
                    const cell = this.cells[index];
                    if (cell.disabled) return;

                    const newDate = this.getDateOfCell(cell);
                    if(this.selectionMode=='range'){
                        if (this.minDate && this.maxDate) {//有最小最大---- 保留上选择的最大最小，从新选则，选最小
                            const minDate = new Date(newDate.getTime());
                            const maxDate = null;
                            this.rangeState.selecting = true;
                            this.markRange(this.minDate);

                            this.$emit('on-pick', {minDate, maxDate}, false);
                        } else if (this.minDate && !this.maxDate) {//有最小无最大----最小已经选择，选最大值
                            if (newDate >= this.minDate) {
                                const maxDate = new Date(newDate.getTime());
                                this.rangeState.selecting = false;

                                this.$emit('on-pick', {minDate: this.minDate, maxDate});
                            } else {
                                const minDate = new Date(newDate.getTime());

                                this.$emit('on-pick', {minDate, maxDate: this.maxDate}, false);
                            }
                        } else if (!this.minDate) {//无最小----选最小
                            const minDate = new Date(newDate.getTime());
                            this.rangeState.selecting = true;
                            this.markRange(this.minDate);

                            this.$emit('on-pick', {minDate, maxDate: this.maxDate}, false);
                        }
                    }else {
                        this.$emit('on-pick', newDate);
                    }
                }
                this.$emit('on-pick-click');
            },
            getDateOfCell (cell) {
                let year = this.year;
                let month = cell.text==0?0:cell.text-1;
                let day = '01';

                const date = this.date;
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();

                if (cell.type === 'prev-month') {
                    if (month === 0) {
                        month = 11;
                        year--;
                    } else {
                        month--;
                    }
                } else if (cell.type === 'next-month') {
                    if (month === 11) {
                        month = 0;
                        year++;
                    } else {
                        month++;
                    }
                }

                return new Date(year, month, day, hours, minutes, seconds);
            },
            markRange (maxDate) {
                const minDate = this.minDate;
                if (!maxDate) maxDate = this.maxDate;

//                const minDay = clearHours(new Date(minDate));
//                const maxDay = clearHours(new Date(maxDate));
                const minMonth = clearMonth(new Date(minDate));
                const maxMonth = clearMonth(new Date(maxDate));

                this.cells.forEach(cell => {
                    if (cell.type === 'today' || cell.type === 'normal') {
                        var nowDate = new Date(this.year,cell.text-1);
                        const time = clearMonth(nowDate);//clearHours(new Date(this.year, this.month, cell.text));
                        cell.range = time >= minMonth && time <= maxMonth;
                        cell.start = minDate && time === minMonth;
                        cell.end = maxDate && time === maxMonth;
                    }
                });
            },
            handleMouseMove (event) {
                if (!this.rangeState.selecting) return;
                this.$emit('on-changerange', {
                    minDate: this.minDate,
                    maxDate: this.maxDate,
                    rangeState: this.rangeState
                });

                const target = event.target;
                if (target.tagName === 'EM') {
                    const cell = this.cells[parseInt(event.target.getAttribute('index'))];
//                    if (cell.disabled) return;    // todo 待确定
                    this.rangeState.endDate = this.getDateOfCell(cell);
                }
            },
            tCell (cell) {
                return this.t(`i.datepicker.months.m${cell}`);
            }
        }
    };
</script>
