<template>
  <div id="app">
    <p class="title">Mock</p>
    <hr>
    <div class="selectorWrapper">
      <p class="remark">机型选择(default)</p>
      <tree-selector ref="tree1" :data="data_device" v-if="data_device" @change="change1" ></tree-selector>
      <!-- :config="{selected:['2']}" -->
    </div>
    <div class="selectorWrapper">
      <p class="remark">地区选择(有已选项)</p>
      <tree-selector :data="data_district" v-if="data_district" :config="{selected:['0']}" @change="change2"></tree-selector>
    </div>
    <div class="selectorWrapper">
      <p class="remark">地区选择(单选)</p>
      <tree-selector :data="data_district" v-if="data_district" :config="{multiple:false}"></tree-selector>
    </div>
    <div class="selectorWrapper">
      <p class="remark">地区选择(显示所有父节点)</p>
      <tree-selector :data="data_district" v-if="data_district" :config="{format:{allParents:true}}"></tree-selector>
    </div>
    <div class="selectorWrapper">
      <p class="remark">地区选择(显示所有父节点,除去第一层)</p>
      <tree-selector :data="data_district" v-if="data_district" :config="{format:{allParents:true,noTop:true}}"></tree-selector>
    </div>

    <p class="title">请求接口</p>
    <hr>

    <div class="selectorWrapper">
      <p class="remark">三层
      </p>
      <tree-selector :data="apiData1" v-if="apiData1" @change="change3" ref="tree"></tree-selector>
    </div>

    <div class="selectorWrapper">
      <p class="remark">两层
      </p>
      <tree-selector :data="apiData2" v-if="apiData2"></tree-selector>
    </div>
    <router-view/>
  </div>
</template>

<script>
import treeSelector from "@/components/treeSelector/treeSelector";

import axios from "axios";

export default {
  name: "App",
  components: {
    treeSelector
  },
  data() {
    return {
      data_device: null,
      data_district: null,
      selectedDistrict: ["01", "021"],
      apiData1: null,
      apiData2: null,

      select1: { allParents: true },
      select2: null,
      select3: null,
      select4: null,
      config1: {},

      bin: ["1"]
    };
  },
  created() {
    setTimeout(() => {
      this.$refs.tree1.setSelected(["2"]);
    }, 1000);

    this.config1 = {
      format: this.select1
      // showSelected: false
    };

    axios.get("/api/data2").then(res => {
      // // this.datalist = res.data.data.;
      // Bus.$data.maxLevel = res.data.data.maxLevel;
      // Bus.$data.data_origin = res.data.data.data;

      // //元數據處理成嵌套結構
      // let dataTree = this.nestData(Bus.$data.data_origin, Bus.$data.maxLevel);
      // Bus.$data.data_tree = dataTree;
      // this.datalist = dataTree;
      this.data_device = res.data.data;
    });
    axios.get("/api/district").then(res => {
      this.data_district = res.data.data;
      // console.log(this.data_district);
    });

    axios
      .get("https://dev-web-services.tvflnet.com/dimension/V1/1103000")
      .then(res => {
        if ("0" == res.data.ret.retCode) {
          this.apiData1 = res.data.data;
          this.$nextTick(()=>{
            this.$refs.tree.setSelected([1]);
          });
        }
      });

    axios
      .get("https://dev-web-services.tvflnet.com/dimension/V1/1104000")
      .then(res => {
        if ("0" == res.data.ret.retCode) {
          this.apiData2 = res.data.data;
        }
      });
  },
  methods: {
    change1(data) {
      console.log("change 1");
      console.log(data);
    },
    change2() {
      console.log("change 2");
    },
    change3(data) {
      console.log(data);
    }
  }
};
</script>

<style>
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
#app .selectorWrapper {
  margin-bottom: 50px;
}

.remark {
  font-size: 12px;
  margin: 0;
  color: lightslategray;
}
.title {
  margin: 0;
  padding: 1rem 0;
  /* background: gray; */
}
/* hr{
  margin-top: 0;
} */
</style>
