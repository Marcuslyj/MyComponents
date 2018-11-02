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
    </div>


</template>

<script>
import axios from "axios";
import transferSelector from "../components/second-select-levelControl/transfer-selector";
export default {
  name: "",
  data() {
    return {};
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
      });
  },
  methods:{
    selectChange(data) {
      console.log("change了");
      console.log(data);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>