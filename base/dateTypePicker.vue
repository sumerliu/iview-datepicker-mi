<template>
    <div >
        <Radio-group v-model="currentView" style='margin: 5px 20px' >
            <Radio label="week"><span>周</span></Radio>
            <Radio label="month"><span>月</span></Radio>
        </Radio-group>
    </div>
</template>
<script>
    import radioGroup from '../iview-componets/radio/radio-group.vue';
    import radio from '../iview-componets/radio/radio.vue';
    import Locale from '../mixins/locale';

    const prefixCls = 'ivu-picker';

    export default {
        mixins: [ Locale ],
        components: { radioGroup,radio },
        props: {

        },
        data () {
            return {
                currentView:'week'
            };
        },

        watch: {
            currentView(newVal){
                this.$emit('on-pick-type', newVal);
            }
        },
        methods: {

        }
    };
</script>
