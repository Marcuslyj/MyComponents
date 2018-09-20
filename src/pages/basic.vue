<template>
    <div class="wrapper">
        <div>添加筛选项，切换数据源</div>
        <transfer-selector :data="data_client" :config="{
      dataType:'1702001',
      dataOptions:[
        {name:'芯片',value:'1702001'},
        {name:'Launcher',value:'1702002'},
        {name:'内容',value:'1702003'},
      ],
      server:'https://dev-web-services.tvflnet.com/dimension/v1/'
    }" @change="selectChange"></transfer-selector>

        <transfer-selector ref="tree1" :config="{
      dataOptions:[
        {name:'芯片',value:'1702001'},
        {name:'Launcher',value:'1702002'},
        {name:'内容',value:'1702003'},
      ],
      server:'https://dev-web-services.tvflnet.com/dimension/v1/'
    }" @change="selectChange"></transfer-selector>
        <Button @click="initTree1">内部初始化</Button>

        <transfer-selector ref="tree2" :config="{
      dataOptions:[
        {name:'芯片',value:'1702001'},
        {name:'Launcher',value:'1702002'},
        {name:'内容',value:'1702003'},
      ],
      server:'https://dev-web-services.tvflnet.com/dimension/v1/'
    }" @change="selectChange"></transfer-selector>
        <Button @click="initTree2">带已选内部初始化</Button>

        <transfer-selector ref="tree3" :data="data3" :config="{
      dataOptions:[
        {name:'芯片',value:'1702001'},
        {name:'Launcher',value:'1702002'},
        {name:'内容',value:'1702003'},
      ],
      server:'https://dev-web-services.tvflnet.com/dimension/v1/'
    }" @change="selectChange"></transfer-selector>
        <Button @click="initTree3">传入数据源，再初始化已选</Button>

        <transfer-selector ref="treeRegion0" :config="{
      expandTo:1,
      server:'https://dev-web-services.tvflnet.com/region/level-list',
    }" @change="selectChange"></transfer-selector>


        <transfer-selector :data="data_client" :config="{
      dataType:'1702001',
      dataOptions:[
        {name:'芯片',value:'1702001'},
        {name:'Launcher',value:'1702002'},
        {name:'内容',value:'1702003'},
      ],
      server:'https://dev-web-services.tvflnet.com/dimension/v1/'
    }" @change="selectChange"></transfer-selector>
        <transfer-selector ref="treeRegion" :config="{
      expandTo:1,
      server:'https://dev-web-services.tvflnet.com/region/level-list',
    }" @change="selectChange"></transfer-selector>
        <transfer-selector ref="treeRegion2" :config="{
      expandTo:1,
      server:'https://dev-web-services.tvflnet.com/region/level-list',
      readonly:true,
      title:'地域'
    }" @change="selectChange"></transfer-selector>
    </div>
</template>

<script>
import axios from "axios";

import transferSelector from "@/components/transfer-selector/transfer-selector";

export default {
  name: "",
  data() {
    return {
      data_client: "",
      data3: null
    };
  },
  components: {
    transferSelector
    // transferSearch
  },

  created() {
    //初始化:
    //注意:
    //1.有dataOptions,则会显示右上角的可切换数据源

    //方式1:传入data
    axios
      .get("https://dev-web-services.tvflnet.com/dimension/v1/1702001")
      .then(res => {
        if ("0" == res.data.ret.retCode) {
          this.data_client = res.data.data;
        }
      });
    //初始化方式2:有配置url,支持内部直接调init()
    //调用组件内部init()

    this.$nextTick(() => {
      this.$refs.treeRegion.init();

      // this.$refs.treeRegion0.init();
      this.$refs.treeRegion0.initWithSelected({ data: ["120000", "110000"] });
      this.$refs.treeRegion2.initWithSelected({ data: ["120000", "110000"] });
    });

    //回显
    //格式
    // {
    //   type:"",
    //   data:[],
    // }
    //1.传selectedData,不传源数据，调用initWithSelected()
    //2.传源数据，调用setSelected()

    axios
      .get("https://dev-web-services.tvflnet.com/dimension/v1/1702002")
      .then(res => {
        if ("0" == res.data.ret.retCode) {
          this.data3 = res.data.data;
        }
      });
  },
  methods: {
    initTree1() {
      this.$refs.tree1.init();
    },
    initTree2() {
      this.$refs.tree2.initWithSelected({
        type: "1702002",
        data: ["1-4-43", "1-5-49", "2-4-41", "2-4-42"]
      });
    },
    initTree3() {
      this.$refs.tree3.setSelected({
        type: "1702002",
        data: ["1-4-43", "1-5-49", "2-4-41", "2-4-42"]
      });
    },
    selectChange(data) {
      console.log("change了");
      console.log(data);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>