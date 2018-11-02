<template>
  <div id="app">
    <div class="tab-wrapper">
      <router-link to="/basic" active-class="tabActive">基本使用</router-link>
      <router-link to="/secondSelect" active-class="tabActive">二次选择</router-link>
      <router-link to="/secondSelectLeaf" active-class="tabActive">二次选择(结果只包括叶节点)</router-link>
    </div>




    <router-view/>

  </div>
</template>

<script>

export default {
  name: "App",
  components: {},
  data() {
    return {};
  }
};
</script>

<style lang="scss" >
#app {
  padding: 20px;
}
.tabActive {
  font-size: 16px;
  font-weight: 700;
}
.tab-wrapper{
  margin-bottom: 20px;
   a{
    padding: 0 20px;
  }
}
</style>
