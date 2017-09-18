import Picker from '../picker.vue';
import DatePanel from '../panel/date.vue';
// import DateRangePanel from '../panel/date-range.vue';
// import WeekPanel from '../panel/week.vue';
// import MonthRangePanel from '../panel/month-range.vue';
//
// const getPanel = function (type) {
//     if (type === 'daterange' || type === 'datetimerange') {
//         return DateRangePanel;
//     }else if(type === 'monthrange') {
//         return MonthRangePanel;
//     }else if(type=='week'){
//         return WeekPanel;
//     }
//     return DatePanel;
// };

import { oneOf } from '../utils/assist';

export default {
    mixins: [Picker],
    props: {
        type: {
            validator (value) {
                return oneOf(value, ['year', 'month', 'week', 'date', 'daterange', 'datetime', 'datetimerange','monthrange']);
            },
            default: 'date'
        },
        value: {}
    },
    created () {
        this.currentValue = '';
        // if (!this.currentValue) {
        //     if (this.type === 'daterange' || this.type === 'datetimerange' || this.type === 'monthrange') {
        //         this.currentValue = ['',''];
        //     } else {
        //         this.currentValue = '';
        //     }
        // }

        this.panel = DatePanel;
    }
};
