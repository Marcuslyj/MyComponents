
<template>
  <div class="wrapper">
    <layerItem :datalist="datalist" class="noFirstExpand" :multiple="multiple" :selected="selected" :unique="unique" :maxLevel="maxLevel" :dataTree="dataTree" :dataOrigin="dataOrigin"></layerItem>
    <div class="dataSelected-wrapper" v-if="showSelected" v-show="showSelected && dataSelected.length">
      <div class="label">
        <span>已选择：</span>
      </div>
      <div class="dataSelected">
        <!-- <span v-for="(item,index) in dataSelected" :key="index" @click="deleteItem(item)">{{item|formatName(dataOrigin,noTop)}}</span> -->
        <span v-for="(item,index) in dataSelected" :key="index" @click="deleteItem(item)">{{item|Name(dataOrigin,format)}}</span>

      </div>
    </div>
  </div>
</template>

<script>
// import axios from "axios";
import layerItem from "./layerItem/layerItem";
import Bus from "./bus.js";

export default {
  name: "treeSelector",
  // props: ["data", "selected", "noTop"],
  props: ["data", "config"],
  data() {
    return {
      datalist: [],
      //组件内部
      dataSelected: [],
      format: {},
      //传入
      selected: [],
      maxLevel: 0,
      dataTree: null,
      dataOrigin: null,
      dataIn: JSON.parse(JSON.stringify(this.data)),
      unique: "",
      showSelected: true,
      multiple: true
    };
  },
  components: { layerItem },
  created() {
    //初始化操作
    if (this.config) {
      console.log(this.config);

      //selected
      if (this.config.selected) {
        this.selected = this.config.selected.concat();
        this.dataSelected = this.config.selected.concat();
      }
      //format
      if (this.config.format) {
        this.format = this.config.format;
      }
      //showSelected
      if (null != this.config.showSelected) {
        if (!this.config.showSelected) {
          this.showSelected = false;
        }
      }
      //mutiple
      if (null != this.config.multiple) {
        if (!this.config.multiple) {
          this.multiple = false;
        }
      }
    }

    //生成唯一id
    this.unique = this.genID(6);
    // console.log(this.unique);

    this.maxLevel = this.dataIn.maxLevel;
    this.dataOrigin = this.dataIn.datas;

    //元數據處理成嵌套結構
    let dataTree = this.nestData(this.dataOrigin, this.maxLevel);
    this.dataTree = dataTree;
    this.datalist = dataTree;
    //验证唯一key
    Bus.$on("selectChange", (data, unique) => {
      if (unique === "treeSelector" + this.unique) {
        this.dataSelected = data;
        this.$emit("change", this.dataSelected);
      }
    });
  },
  methods: {
    /**
     * 方法：生成唯一key
     */
    genID(length) {
      return Number(
        Math.random()
          .toString()
          .substr(3, length) + Date.now()
      ).toString(36);
    },
    /**
     * 方法：删除一个已选
     */
    deleteItem(item) {
      if (this.dataSelected.indexOf(item) !== -1) {
        this.dataSelected.splice(this.dataSelected.indexOf(item), 1);
        Bus.$emit(
          "selectChange",
          this.dataSelected,
          "treeSelector" + this.unique
        );
      }
    },
    /**
     *方法：一维数组处理成嵌套结构
     */
    nestData(data, levelMax) {
      let _data = data.concat();
      let data_pack = [];

      // 從下往上
      for (let level = levelMax; level > 0; level--) {
        //篩選出相應層級
        let indexs = [];
        let data_level = _data.filter((item, index) => {
          if (item.level == level) {
            indexs.push(index);
          }
          return item.level == level;
        });

        //組裝到上一級
        for (let i = 0; i < data_level.length; i++) {
          //篩選出父節點
          //filter 返回新的數組
          let parentIndex = null;
          let parentNode = _data.filter((item, index) => {
            if (item.id == data_level[i].parentId) {
              parentIndex = index;
            }
            return item.id == data_level[i].parentId;
          });
          if (_data[parentIndex] && !_data[parentIndex].children) {
            _data[parentIndex].children = [];
          }
          //組裝到父級
          if (_data[parentIndex]) {
            _data[parentIndex].children.push(_data[indexs[i]]);
          }
        }
      }
      //取出第一層數據
      data_pack = _data.filter(item => {
        return item.level == 1;
      });
      // console.log(data_pack);

      return data_pack;
    },
    //设置dataSelected
    setSelected(data) {
      if (data && data.length) {
        let _data = data.map(item=>{
          return item.toString();
        });
        Bus.$emit("selectChange", _data, "treeSelector" + this.unique);
      }
    }
  },
  filters: {
    Name(id, dataOrigin, format) {
      if (format && format.allParents) {
        let name_self = "";
        let prefix = "";
        let item_self = [];
        if (dataOrigin) {
          item_self = dataOrigin.filter(_item => {
            return _item.id == id;
          });
          if (item_self.length) {
            name_self = item_self[0].name;

            let parentNames = [];
            let son = item_self[0];

            while (son.parentId) {
              if (format.noTop && "2" == son.level) {
                break;
              }
              let filter = dataOrigin.filter(_item => {
                return _item.id == son.parentId;
              });
              if (filter.length) {
                parentNames.push(filter[0].name);
                son = filter[0];
              }
            }
            if (parentNames.length) {
              prefix = parentNames.reverse().join("_") + "_";
            }
          }
        }
        return prefix + name_self;
      } else {
        let name_self = "";
        let name_parent = "";
        let item_parent = null;
        let item_self = [];
        if (dataOrigin) {
          item_self = dataOrigin.filter(_item => {
            return _item.id == id;
          });
        }
        if (item_self.length && dataOrigin) {
          item_parent = dataOrigin.filter(_item => {
            return _item.id == item_self[0].parentId;
          });
        }
        name_self = item_self.length ? item_self[0].name : "";
        if (format && format.noTop && "2" == item_self[0].level) {
          return name_self;
        }
        if (item_parent) {
          name_parent = item_parent.length ? item_parent[0].name + "_" : "";
        }
        return name_parent + name_self;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.wrapper {
  line-height: 1;
  .noFirstExpand {
    padding-left: 0;
    /deep/ .icon-wrapper {
      width: 0;
    }
  }

  .dataSelected-wrapper {
    display: flex;
    margin-top: 8px;
    .label {
      flex-shrink: 0;
      > span {
        font-size: 12px;
        line-height: 24px;
      }
    }

    .dataSelected {
      flex-grow: 1;

      & > span {
        display: inline-block;
        border-radius: 3px;
        color: #fff;
        padding: 3px 5px;
        font-size: 12px;
        background: #2d8cf0;
        // line-height: 1;
        margin: 2px;
        cursor: default;
      }
    }
  }
}
</style>
