<template>
  <div class="layer-item-wrapper">
    <div class="layer-item">
      <div class="icon-wrapper">
        <i class="iconfont icon-jian" v-show="expand" @click="unExpandClick()"></i>
        <i class="iconfont icon-jia" v-show="!expand" @click="expandClick()"></i>
      </div>
      <div class="item-wrapper">
        <div class="item" :class="{ 
                'selectThis': isSelectThis(index,item),
                'selectSub':isSelectSub(index,item),
                'selectThisExpand':isSelectThisExpand(index,item),
                'selectNoneExpand':isSelectNoneExpand(index,item),
                'selectSubExpand':isSelectSubExpand(index,item)
                 }" v-for="(item,index) in datalist" :key="index" @click="clickItem($event,item,index)" @dblclick="dblclick($event,item,index)">
          {{ item.name }}
          <!-- 勾勾 -->
          <!-- <i class="iconfont icon-duigou3"></i> -->
          <i class="iconfont icon-checktriangle"></i>
        </div>
      </div>
    </div>

    <layerItem v-for="(item,index) in datalist" v-if="item.children && item.children.length" :key="index" v-show="activeIndex===index && expand" :datalist="item.children" :unique="unique" :maxLevel="maxLevel" :dataTree="dataTree" :dataOrigin="dataOrigin" :multiple="multiple" :selected="selected"></layerItem>
  </div>

</template>

<script >
import Bus from "../bus.js";
export default {
  name: "layerItem",
  props: [
    "open",
    "datalist",
    "unique",
    "maxLevel",
    "dataTree",
    "dataOrigin",
    "selected",
    "multiple"
  ],
  data() {
    return {
      expand: true,
      dataSelected: this.selected ? this.selected.concat() : [],
      activeIndex: null,
      clickTimer: null
    };
  },
  created() {
    //监听已选变化，更新组件内部数据
    Bus.$on("selectChange", (data, unique) => {
      if (unique === "treeSelector" + this.unique) {
        this.dataSelected = data;
      }
    });
  },
  methods: {
    //点击收起
    unExpandClick() {
      this.expand = false;
    },
    //点击展开
    expandClick() {
      this.expand = true;
    },
    nullOrEmpty(item) {
      if (item == null || item.trim() === "") {
        return true;
      }
      return false;
    },
    //六类样式定义
    //选到当前
    isSelectThis(index, item) {
      //判断已选是否存在
      let noChildren = false;
      if (!item.children || item.children.length === 0) {
        noChildren = true;
      }
      if (
        this.dataSelected.indexOf(item.id) !== -1 &&
        (!this.expand || this.activeIndex !== index || noChildren)
      ) {
        return true;
      }
      return false;
    },
    //展开，未选择
    isSelectNoneExpand(index, item) {
      if (this.expand && this.activeIndex === index && item.children) {
        if (this.dataSelected.indexOf(item.id) === -1) {
          if (0 === this.getChildrenNodesSelected(item).length) {
            return true;
          }
        }
      }
      return false;
    },
    //选到当前项，展开子项
    isSelectThisExpand(index, item) {
      //判断已选是否存在
      if (
        this.dataSelected.indexOf(item.id) !== -1 &&
        this.activeIndex === index &&
        this.expand &&
        item.children
      ) {
        return true;
      }
      return false;
    },
    //选到当前项的子项(激活当前项，展开，有子项已选)
    isSelectSubExpand(index, item) {
      if (
        this.activeIndex === index &&
        this.expand &&
        this.getChildrenNodesSelected(item).length
      ) {
        return true;
      }
      return false;
    },
    //选到子选项，子选项(有子项已选，+（！expand或expand&&不是当前项激活）)
    isSelectSub(index, item) {
      if (!this.expand || (this.expand && this.activeIndex !== index)) {
        if (
          this.dataSelected.indexOf(item.id) === -1 &&
          this.getChildrenNodesSelected(item).length
        ) {
          return true;
        }
      }
      return false;
    },
    isSelectNone(item) {
      if (
        this.dataSelected.indexOf(item.id) === -1 &&
        this.getChildrenNodesSelected(item).length === 0
      ) {
        return true;
      }
      return false;
    },
    clickItem($event, item, index, expandBtn) {
      clearTimeout(this.clickTimer);
      this.clickTimer = setTimeout(() => {
        //console.log("单击");
        this.singleClickItem($event, item, index, expandBtn);

        console.log(this);
      }, 230);
    },
    dblclick($event, item, index, expandBtn) {
      clearTimeout(this.clickTimer);
      //console.log("双击");
      this.dblclickItem($event, item, index, expandBtn);
    },
    //点击item---------------------------------------------------
    singleClickItem($event, item, index, expandBtn) {
      //没选择情况
      //1
      if (this.isSelectNone(item)) {
        //selectNoneExpand   在此响应
        //console.log("isSelectNone");

        // if (item.children) {
        this.activeIndex = index;
        // }
        //是否单选
        if (!this.multiple) {
          this.dataSelected = [item.id];
        } else {
          this.dataSelected.push(item.id);
          //删除已选父级
          this.deleteParentSelected(item);
        }
        //清掉子组件activeIndex后，恢复自身activeindex
        this.unExpandAllchildren(this);
        this.activeIndex = index;

        Bus.$emit(
          "selectChange",
          this.dataSelected,
          "treeSelector" + this.unique
        );
      } else if (this.isSelectThis(index, item)) {
        //白选2
        //console.log("isSelectThis");

        if (this.expand && index !== this.activeIndex && item.children) {
          this.activeIndex = index;
        } else {
          this.activeIndex = index;
          //1.清除已选择

          if (this.dataSelected.indexOf(item.id) !== -1) {
            //是否单选
            if (!this.multiple) {
              this.dataSelected = [];
            } else {
              this.dataSelected.splice(this.dataSelected.indexOf(item.id), 1);
            }

            Bus.$emit(
              "selectChange",
              this.dataSelected,
              "treeSelector" + this.unique
            );
          }
        }
      } else if (this.isSelectThisExpand(index, item)) {
        //灰选3
        //console.log("isSelectThisExpand");

        //清除数据
        if (this.dataSelected.indexOf(item.id) !== -1) {
          //是否单选
          if (!this.multiple) {
            this.dataSelected = [];
          } else {
            this.dataSelected.splice(this.dataSelected.indexOf(item.id), 1);
          }
          Bus.$emit(
            "selectChange",
            this.dataSelected,
            "treeSelector" + this.unique
          );
        }
        ////不需要，选到当前代表没选到子项
        // //清除已选子项
        // this.deleteSubSelected(this.prefix);

        this.activeIndex = null;
      } else if (this.isSelectSub(index, item)) {
        //4
        // //选子非展,点击变成选子展
        //console.log("isSelectSub");

        this.activeIndex = index;
        this.expand = true;
      } else if (this.isSelectSubExpand(index, item)) {
        //选子展5
        //console.log("isSelectSubExpand");

        // //点击，请子项
        // let ChildrenNodes = this.getChildrenNodesSelected(item);
        // console.log(ChildrenNodes);

        // if (ChildrenNodes.length) {
        //   //是否单选
        //   if (!this.multiple) {
        //     this.dataSelected = [];
        //   } else {
        //     ChildrenNodes.map(_item => {
        //       if (this.dataSelected.indexOf(_item) !== -1) {
        //         this.dataSelected.splice(this.dataSelected.indexOf(_item), 1);
        //       }
        //     });
        //   }

        //   Bus.$emit(
        //     "selectChange",
        //     this.dataSelected,
        //     "treeSelector" + this.unique
        //   );
        // }
        //
        this.activeIndex = null;
      }
    },
    //双击
    dblclickItem($event, item, index, expandBtn) {
      if (this.isSelectSubExpand(index, item)) {
        //点击，请子项
        let ChildrenNodes = this.getChildrenNodesSelected(item);

        if (ChildrenNodes.length) {
          //是否单选
          if (!this.multiple) {
            this.dataSelected = [];
          } else {
            ChildrenNodes.map(_item => {
              if (this.dataSelected.indexOf(_item) !== -1) {
                this.dataSelected.splice(this.dataSelected.indexOf(_item), 1);
              }
            });
          }

          Bus.$emit(
            "selectChange",
            this.dataSelected,
            "treeSelector" + this.unique
          );
        }

        this.activeIndex = null;
        //
        this.unExpandAllchildren(this);
      } else {
        this.singleClickItem($event, item, index, expandBtn);
      }
    },
    deleteSubSelected(item) {
      let ChildrenNodesSelected = [];

      if (item.children && item.children.length) {
        //取子節點
        ChildrenNodesSelected = this.getChildrenNodesSelected(item);

        //刪子節點
        ChildrenNodesSelected.map(_item => {
          this.dataSelected.splice(this.dataSelected.indexOf(_item), 1);
        });
        Bus.$emit(
          "selectChange",
          this.dataSelected,
          "treeSelector" + this.unique
        );
      }
    },
    deleteParentSelected(item) {
      let flag = false;

      let parentNodes = this.getParents(item);

      parentNodes.map(_item => {
        if (this.dataSelected.indexOf(_item) !== -1) {
          this.dataSelected.splice(this.dataSelected.indexOf(_item), 1);
          flag = true;
        }
      });
      if (flag) {
        Bus.$emit(
          "selectChange",
          this.dataSelected,
          "treeSelector" + this.unique
        );
      }
    },
    getChildrenNodesSelected(item) {
      let ChildrenNodes = [];
      let parentNode_now = [item.id];

      if (this.maxLevel > item.level) {
        for (
          let level = Number(item.level) + 1;
          level <= this.maxLevel;
          level++
        ) {
          let filter = this.dataOrigin.filter(_item => {
            return parentNode_now.indexOf(_item.parentId) !== -1;
          });
          parentNode_now = [];
          for (let i = 0; i < filter.length; i++) {
            parentNode_now.push(filter[i].id);
            if (
              this.dataSelected.indexOf(filter[i].id) !== -1 &&
              ChildrenNodes.indexOf(filter[i].id) === -1
            ) {
              ChildrenNodes.push(filter[i].id);
            }
          }

          if (filter.length === 0) {
            break;
          }
        }
      }
      return ChildrenNodes;
    },
    getParents(item) {
      let item_now = item;
      let parentId = item_now.parentId;
      let parentNodes = [];
      while (item_now.parentId && item_now.parentId.trim() !== "") {
        let filter = this.dataOrigin.filter(_item => {
          return _item.id == parentId;
        });
        if (filter.length) {
          parentNodes.push(filter[0].id);
        }

        item_now = this.dataOrigin.filter(_item => {
          return _item.id == parentId;
        })[0];
        parentId = item_now.parentId;
      }
      return parentNodes;
    },
    //收起展开子节点
    unExpandAllchildren(parentNode) {
      parentNode.activeIndex = null;
      for (let i = 0; i < parentNode.$children.length; i++) {
        this.unExpandAllchildren(parentNode.$children[i]);
      }
    }
  }
};
</script>


<style lang="scss" scoped>
@import url("../source/css/iconfont.scss");

.layer-item-wrapper {
  width: 100%;
  line-height: 1;
  // padding-left: 20px;
  box-sizing: border-box;

  .layer-item {
    display: flex;
    margin-bottom: 4px;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;

    //
    & > i {
      visibility: hidden;
    }
  }

  .item-wrapper {
    flex-grow: 1;
    background: #f7f7f7;
    padding: 2px;
    font-size: 0;
  }

  .item {
    user-select: none;
    background: #fff;
    display: inline-block;
    line-height: 1;
    color: #2d8cf0;
    border: 1px dashed #2d8cf0;
    margin: 1px 2px;
    padding: 6px 8px;
    font-size: 12px;
    border-radius: 4px;
    min-width: 60px;
    box-sizing: border-box;
    text-align: center;
    cursor: pointer;
    //
    position: relative;
    overflow: hidden;
    //
    & > i {
      display: none;
      position: absolute;
      right: -2px;
      bottom: -1px;
      font-size: 19px;
      color: #2d8cf0;
    }

    &.selectThis,
    &.selectThisExpand {
      border-style: solid;
      position: relative;

      //
      & > i {
        display: inline-block;
        z-index: 1;
      }
    }

    &.selectThisExpand {
      background: #2d8cf0;
      color: #fff;
    }
    &.selectSubExpand {
      background: #2d8cf0;
      color: #fff;
      border-style: solid;
    }

    &.selectSub {
      border-style: solid;
    }

    &.selectNoneExpand {
      background: #2d8cf0;
      color: #fff;
      border-style: dashed;

    //   border-width: 2px;
    // padding: 5px 7px;
    border-color: #f7f7f7;
    }
    &.selectThisExpand::after {
      position: absolute;
      right: 0;
      bottom: 0;
      content: " ";
      width: 7px;
      height: 11px;
      background: #fff;
      transform: rotate(45deg);
    }
  }
}
</style>



