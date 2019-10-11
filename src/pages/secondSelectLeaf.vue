<template>
    <div class="wrapper">
        <p>组件用作二次选择</p>
        <transfer-selector ref="tree1" :config="{
            secondSelect:true,
            server:'https://dev-web-services.tvflnet.com/dimension/v1/1702001',
            showSelectType:true,
            onlyLeaf:true
            }" @change="selectChange" >
        </transfer-selector>
        <p>组件用作一次选择</p>
        <transfer-selector ref="tree2" :config="{
            server:'https://dev-web-services.tvflnet.com/dimension/v1/1702001'
            }" @change="selectChange" >
        </transfer-selector>
        <p>组件用作一次选择，含已选择</p>
        <transfer-selector ref="tree3" :config="{
            server:'https://dev-web-services.tvflnet.com/dimension/v1/1702001'
            }" @change="selectChange" >
        </transfer-selector>
        <p>组件用作显示已选，只读</p>
        <transfer-selector ref="tree4" :config="{
            readonly:true,
            server:'https://dev-web-services.tvflnet.com/dimension/v1/1702001'
            }" >
        </transfer-selector>


        <transfer-selector ref="test" :data="testData" :config="{
            onlyLeaf: true,
            expandTo: 1
        }" @change="testChange"></transfer-selector>




    </div>


</template>

<script>
import axios from "axios";
import transferSelector from "../components/second-select-levelControl/transfer-selector";
export default {
  name: "",
  data() {
    return {
        testData: null
    };
  },
  components: {
    transferSelector
  },
  created(){
      this.$nextTick(()=>{
        this.$refs.tree1.initWithSelected({
            data: ["1", "2-1-50", "2-1-42"]
        });
        this.$refs.tree2.init();
        this.$refs.tree3.initWithSelected({
            data: ["1", "2-1-50", "2-1-42"]
        });
        this.$refs.tree4.initWithSelected({
            data: ["1", "2-1-50", "2-1-42"]
        });


        this.testData = {
            maxLevel: 3,
            datas: [{
                    id: "345B665BB10AD775C65DE0B6A9200B13",
                    level: 1,
                    name: "全部广告位",
                    parentId: null,
                    title: "全部广告位"
                },
                {
                    id: 1,
                    level: 3,
                    name: "贴片广告",
                    parentId: "5AF016C9D2B1E0BC505B041F2845B382",
                    title: "贴片广告"
                },
                {
                    id: 2,
                    level: 3,
                    name: "中插广告",
                    parentId: "5AF016C9D2B1E0BC505B041F2845B382",
                    title: "中插广告"
                },
                {
                    id: 7,
                    level: 3,
                    name: "啦啦啦广告",
                    parentId: "5AF016C9D2B1E0BC505B041F2845B382",
                    title: "啦啦啦广告"
                },
                {
                    id: "5AF016C9D2B1E0BC505B041F2845B382",
                    level: 2,
                    name: "腾讯",
                    parentId: "345B665BB10AD775C65DE0B6A9200B13",
                    title: "腾讯"
                },
                {
                    id: 3,
                    level: 3,
                    name: "应用开屏",
                    parentId: "7C09BC68CA2E11D7AE9403BE35D0A69E",
                    title: "应用开屏"
                },
                {
                    id: 8,
                    level: 3,
                    name: "东东",
                    parentId: "7C09BC68CA2E11D7AE9403BE35D0A69E",
                    title: "东东"
                },
                {
                    id: "7C09BC68CA2E11D7AE9403BE35D0A69E",
                    level: 2,
                    name: "爱奇艺",
                    parentId: "345B665BB10AD775C65DE0B6A9200B13",
                    title: "爱奇艺"
                }
            ]
        }

        // setTimeout(()=>{
            this.$nextTick(()=>{
                this.$refs.test.setSelected({
                    data: [1, 2, 7, 3, 8]
                });
            });

        // },500);
      });
  },
  methods:{
    selectChange(data) {
      console.log("change了");
      console.log(data);
    },
    testChange(data){
        console.log(data);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>