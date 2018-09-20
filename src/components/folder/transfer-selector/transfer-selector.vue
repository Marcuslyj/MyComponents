<template>
  <div class="wrapper">
    <div class="ivu-transfer">
      <!-- 左侧 -->
      <div class="ivu-transfer-list" ref="left-wrapper" >
        <div class="ivu-transfer-list-header">
          <span class="ivu-transfer-list-header-title">
            <Checkbox v-model="checkAll_left" @on-change="toggleAll_left" :disabled="dataLeft.length ==0">未选</Checkbox>
          </span>
        </div>
        <div class="filter" v-if="dataOptions && dataOptions.length">
          <Select v-model="data_type" size="small" style="width:100px" @on-change="dataTypeChange">
            <Option v-for="(item,index) in dataOptions" :value="item.value" :key="index">{{ item.name }}</Option>
          </Select>
        </div>
        <div class="ivu-transfer-list-body">
          <Tree ref="leftList" :data="dataLeft" show-checkbox class="ivu-transfer-list-content treeNode" @on-check-change="checkChangeLeft()"></Tree>
        </div>
      </div>
      <!-- 中间 -->
      <div class="ivu-transfer-operation">
        <Button size="small" type="primary" :disabled="checkedLeft.length ==0" @click="add">添加</Button>
        <Button size="small" type="ghost" :disabled="checkedRight.length ==0" @click="remove">删除</Button>
      </div>
      <!-- 右侧 -->
      <div class="ivu-transfer-list" ref="right-wrapper">
        <div class="ivu-transfer-list-header">
          <span class="ivu-transfer-list-header-title">
            <Checkbox v-model="checkAll_right" @on-change="toggleAll_right" :disabled="dataRight.length ==0">已选</Checkbox>
          </span>
          <span class="ivu-transfer-list-header-count">
            <span class="selected_count">已选</span>{{selected.length}}</span>
        </div>
        <div class="ivu-transfer-list-body">
          <Tree ref="rightList" :data="dataRight" show-checkbox class="ivu-transfer-list-content treeNode" @on-check-change="checkChangeRight()"></Tree>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "transfer-selector",
  props: ["data", "config"],
  data() {
    return {
      watchFlag : true,
      dataLeft: [],
      dataRight: [],
      checkedLeft: [],
      checkedRight: [],
      data_raw: {},
      checkAll_left: false,
      checkAll_right: false,
      selected: [],
      data_type: this.config && (this.config.dataType ?  this.config.dataType : (this.config.dataOptions && this.config.dataOptions.length ? this.config.dataOptions[0].value : "")),
      dataOptions:this.config && this.config.dataOptions,
      server:this.config && this.config.server,
    };
  },
  created() {
    //监听数据传入
    const unWatch = this.$watch(
      "data",
      (newVal, oldVal) => {
        if (!oldVal && newVal && this.watchFlag) {
          this.data_raw = this.data;
          this._initialize();
        }
      },
      { immediate: true }
    );
  },
  mounted() {},
  methods: {
    _initialize(callBack) {      
      let expand = true;
      this.data_raw.datas.map(item => {
        item.title = item.name;
        item.expand = expand;

        if (this.config && null != this.config.expandTo) {
          if (item.level > this.config.expandTo) {
            item.expand = false;
          }
        }
      });
      
      this.dataLeft = this.nestData(
        this.data_raw.datas,
        this.data_raw.maxLevel
      );

      if(callBack){
        callBack();
      }
    },
    dataTypeChange(type) {      
      this.getRemoteData(type);
    },
    getRemoteData(type,callBack) {
      //清数据
      this.dataLeft = [];
      this.dataRight = [];
      this.selected = [];
      this.checkedRight = [];
      this.checkedLeft = [];
      this.checkAll_left = false;
      this.checkAll_right = false;
      //取数据
          axios
          .get(this.server + (null == type ? "" : type))
          .then(res => {        
            if ("0" == res.data.ret.retCode) {
              this.data_raw = res.data.data;
              this._initialize(callBack);
            }
          });
      
    },
    nestData(data, levelMax) {
      let $data = JSON.parse(JSON.stringify(data));
      let data_pack = [];

      // 從下往上
      for (let level = levelMax; level > 0; level--) {
        //篩選出相應層級
        let indexs = [];
        let data_level = $data.filter((item, index) => {
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
          let parentNode = $data.filter((item, index) => {
            if (item.id == data_level[i].parentId) {
              parentIndex = index;
            }
            return item.id == data_level[i].parentId;
          });
          if ($data[parentIndex] && !$data[parentIndex].children) {
            $data[parentIndex].children = [];
          }
          //組裝到父級
          if ($data[parentIndex]) {
            $data[parentIndex].children.push($data[indexs[i]]);
          }
        }
      }
      //取出第一層數據
      data_pack = $data.filter(item => {
        return item.level == 1;
      });

      return data_pack;
    },
    checkChangeLeft() {
      this.checkedLeft = this.$refs.leftList.getCheckedNodes();
      if (0 == this.checkedLeft.length) {
        this.checkAll_left = false;
      }
    },
    checkChangeRight() {
      this.checkedRight = this.$refs.rightList.getCheckedNodes();
      if (0 == this.checkedRight.length) {
        this.checkAll_right = false;
      }
    },
    add() {
      //取出
      let nodeStr = JSON.stringify(this.$refs.leftList.getCheckedNodes());

      let $checked = JSON.parse(nodeStr);
      let checked = JSON.parse(nodeStr);

      for (let i = 0; i < checked.length; i++) {
        if (checked[i].hasOwnProperty("nodeKey")) {
          delete checked[i].nodeKey;
        }
        if (checked[i].hasOwnProperty("children")) {
          delete checked[i].children;
        }
        if (checked[i].hasOwnProperty("indeterminate")) {
          delete checked[i].indeterminate;
        }
        if (checked[i].hasOwnProperty("checked")) {
          delete checked[i].checked;
        }

        //添加父节点
        if (
          null != checked[i].parentId &&
          checked.filter(item => {
            return item.id == checked[i].parentId;
          }).length == 0
        ) {
          let parentNode = this.data_raw.datas.filter(_item => {
            return _item.id == checked[i].parentId;
          });
          if (parentNode.length) {
            checked.push(parentNode[0]);
          }
        }
      }

      //递归删除左侧数据
      this.removeFromTree(this.dataLeft, $checked);
      this.addToTree(this.dataRight, checked);
      //清楚“clearIndeterminate”状态
      this.clearIndeterminate(this.dataLeft);
      this.$nextTick(() => {
        this.$refs["left-wrapper"]
          .querySelectorAll(".ivu-checkbox-indeterminate")
          .forEach(node => {
            node.classList.remove("ivu-checkbox-indeterminate");
          });
      });

      //
      this.$nextTick(() => {
        this.checkChangeLeft();
        this.checkChangeRight();
        //
        this.$emit("change",this.getSelected());
        //这样才能触发更新
        this.dataLeft = JSON.parse(JSON.stringify(this.dataLeft));
        //   this.dataRight = null;
        this.dataRight = JSON.parse(JSON.stringify(this.dataRight));
        this.$nextTick();
      });
    },
    remove() {
      //取出
      let nodeStr = JSON.stringify(this.$refs.rightList.getCheckedNodes());
      let $checked = JSON.parse(nodeStr);
      let checked = JSON.parse(nodeStr);

      //清除不需要的属性
      for (let i = 0; i < checked.length; i++) {
        if (checked[i].hasOwnProperty("nodeKey")) {
          delete checked[i].nodeKey;
        }
        if (checked[i].hasOwnProperty("children")) {
          delete checked[i].children;
        }
        if (checked[i].hasOwnProperty("indeterminate")) {
          delete checked[i].indeterminate;
        }
        if (checked[i].hasOwnProperty("checked")) {
          delete checked[i].checked;
        }

        //添加父节点
        if (
          null != checked[i].parentId &&
          checked.filter(item => {
            return item.id == checked[i].parentId;
          }).length == 0
        ) {
          let parentNode = this.data_raw.datas.filter(_item => {
            return _item.id == checked[i].parentId;
          });
          if (parentNode.length) {
            checked.push(parentNode[0]);
          }
        }
      }

      //递归删除左侧数据
      this.removeFromTree(this.dataRight, $checked);
      this.addToTree(this.dataLeft, checked);
      //清楚“clearIndeterminate”状态
      this.clearIndeterminate(this.dataRight);
      this.$nextTick(() => {
        this.$refs["right-wrapper"]
          .querySelectorAll(".ivu-checkbox-indeterminate")
          .forEach(node => {
            node.classList.remove("ivu-checkbox-indeterminate");
          });
      });

      //
      this.$nextTick(() => {
        this.checkChangeRight();
        this.checkChangeLeft();
        //
        this.$emit("change",this.getSelected());
        //  这样才能触发更新
        this.dataLeft = JSON.parse(JSON.stringify(this.dataLeft));
        this.dataRight = JSON.parse(JSON.stringify(this.dataRight));
        this.$nextTick();
      });
    },
    //摘掉
    removeFromTree(target, removesArr) {
      for (let i = 0; i < target.length; i++) {
        if (
          removesArr.filter(item => {
            return target[i].id == item.id;
          }).length
        ) {
          target.splice(i, 1);
          i--;
        } else if (target[i].children) {
          this.removeFromTree(target[i].children, removesArr);
        }
      }
    },
    //装树
    addToTree(target, addsArr, sortFlag = true) {
      //排序
      if (sortFlag) {
        addsArr = addsArr.sort((a, b) => {
          return Number(a.level) - Number(b.level);
        });
      }

      //无数据时
      if (target.length == 0) {
        let nestData = this.nestData(addsArr, this.data_raw.maxLevel);
        target.splice(0, 0, ...nestData);
      } else {
        //先装第一层
        let otherList_level1_ids = target.map(item => {
          return item.id;
        });
        for (let i = 0; i < addsArr.length; i++) {
          if ("1" == addsArr[i].level) {
            if (otherList_level1_ids.indexOf(addsArr[i].id) == -1) {
              let treeFragment_el_ids = [];
              let treeFragment_els = this.getTreelineNodes(addsArr[i], addsArr);

              treeFragment_els.map(item => {
                treeFragment_el_ids.push(item.id);
              });

              target.push(
                this.nestData(treeFragment_els, this.data_raw.maxLevel)[0]
              );

              // 删除待添加数组
              for (let j = 0; j < addsArr.length; j++) {
                if (treeFragment_el_ids.indexOf(addsArr[j].id) !== -1) {
                  addsArr.splice(j, 1);
                  j--;
                }
              }
              i--;
            }
          } else {
            break;
          }
        }
        //遍历，添加
        this.loopTreeAndAdd(target, addsArr);
      }
    },
    getTreelineNodes(item, arr) {
      let nodes = [];
      let parentNode_now = [item.id];

      if (this.data_raw.maxLevel > item.level) {
        for (
          let level = Number(item.level) + 1;
          level <= this.data_raw.maxLevel;
          level++
        ) {
          let filter = arr.filter(_item => {
            return parentNode_now.indexOf(_item.parentId) !== -1;
          });
          parentNode_now = [];
          for (let i = 0; i < filter.length; i++) {
            parentNode_now.push(filter[i].id);
            if (nodes.indexOf(filter[i].id) === -1) {
              nodes.push(filter[i]);
            }
          }
          if (filter.length === 0) {
            break;
          }
        }
      }
      nodes.unshift(item);
      return nodes;
    },
    //遍历目标树（level1节点已经提前装上），添加加点
    loopTreeAndAdd(treeData, adds) {
      for (let i = 0; i < treeData.length; i++) {
        //取出目标节点，现有子节点
        let id_exist = [];
        if (treeData[i].children && treeData[i].children.length) {
          id_exist = treeData[i].children.map(item => {
            return item.id;
          });
        }
        //取到待添加节点中，该目标节点的子节点
        let filters = adds.filter(item => {
          return item.parentId == treeData[i].id;
        });

        if (filters.length) {
          if (null == treeData[i].children) {
            treeData[i].children = [];
          }
          filters.forEach(el => {
            //已存在不添加
            if (id_exist.indexOf(el.id) == -1) {
              //el.expand = true;
              treeData[i].children.push(el);
            }
          });
        }
        if (treeData[i].children && treeData[i].children.length) {
          this.loopTreeAndAdd(treeData[i].children, adds);
        }
      }
    },
    //清掉半选状态（）
    clearIndeterminate(treeData) {
      for (let i = 0; i < treeData.length; i++) {
        treeData[i].indeterminate = false;
        if (treeData[i].children && treeData[i].children.length) {
          this.clearIndeterminate(treeData[i].children);
        }
      }
    },
    //左边树，全选checkbox change
    toggleAll_left(value) {
      if (value) {
        this.checkAll(this.dataLeft);
        setTimeout(() => {
          this.dataLeft = JSON.parse(JSON.stringify(this.dataLeft));
          this.checkChangeLeft();
        }, 100);
      } else {
        this.uncheckAll(this.dataLeft);
        setTimeout(() => {
          this.dataLeft = JSON.parse(JSON.stringify(this.dataLeft));
          this.checkChangeLeft();
        }, 100);
      }
    },
    //右边树，全选checkbox change
    toggleAll_right(value) {
      if (value) {
        this.checkAll(this.dataRight);
        setTimeout(() => {
          this.dataRight = JSON.parse(JSON.stringify(this.dataRight));
          this.checkChangeRight();
        }, 100);
      } else {
        this.uncheckAll(this.dataRight);
        setTimeout(() => {
          this.dataRight = JSON.parse(JSON.stringify(this.dataRight));
          this.checkChangeRight();
        }, 100);
      }
    },
    //全选
    checkAll(treeData) {
      for (let i = 0; i < treeData.length; i++) {
        treeData[i].checked = true;
        treeData[i].indeterminate = false;
        if (treeData[i].children && treeData[i].children.length) {
          this.checkAll(treeData[i].children);
        }
      }
    },
    //全不选
    uncheckAll(treeData) {
      for (let i = 0; i < treeData.length; i++) {
        treeData[i].checked = false;
        treeData[i].indeterminate = false;
        if (treeData[i].children && treeData[i].children.length) {
          this.uncheckAll(treeData[i].children);
        }
      }
    },
    //获取树的计数已选节点id
    getTreeNodes(treeData) {
      let _treeData = JSON.parse(JSON.stringify(treeData));

      let nodesArr = [];
      for (let i = 0; i < _treeData.length; i++) {
        nodesArr.push(_treeData[i]);
        if (_treeData[i].children && _treeData[i].children.length) {
          _treeData.splice(_treeData.length, 0, ..._treeData[i].children);
        }
      }

      //排序
      nodesArr = nodesArr.sort((a, b) => {
        return Number(b.level) - Number(a.level);
      });

      for (let i = 0; i < nodesArr.length; i++) {
        if (null != nodesArr[i].parentId) {
          let allSibs = this.data_raw.datas.filter(item => {
            return item.parentId == nodesArr[i].parentId;
          });
          let nowSibs = nodesArr.filter(item => {
            return item.parentId == nodesArr[i].parentId;
          });

          //如果不全，把父级删除
          if (allSibs.length > nowSibs.length) {
            let parentIds = [];

            let parent_now = nodesArr.filter(item => {
              return item.id == nodesArr[i].parentId;
            })[0];

            while (null != parent_now) {
              parentIds.push(parent_now.id);

              if (parent_now.parentId) {
                let nextParent = this.data_raw.datas.filter(item => {
                  return item.id == parent_now.parentId;
                });
                if (nextParent[0]) {
                  parent_now = nextParent[0];
                } else {
                  break;
                }
              } else {
                break;
              }
            }
            for (let j = 0; j < nodesArr.length; j++) {
              if (parentIds.indexOf(nodesArr[j].id) != -1) {
                nodesArr.splice(j, 1);
                j--;
              }
            }
          } else {
            //全则把自己及sibs删除
            let nowSibs = nodesArr.filter(item => {
              return item.parentId == nodesArr[i].parentId;
            });
            let nowSib_ids = nowSibs.map(item => {
              return item.id;
            });

            for (let j = 0; j < nodesArr.length; j++) {
              if (nowSib_ids.indexOf(nodesArr[j].id) != -1) {
                nodesArr.splice(j, 1);
                j--;
              }
            }
            i--;
          }
        }
      }

      let selectedIds = nodesArr.map(item => {
        return item.id;
      });
      // console.log(nodesArr);
      //
      return selectedIds;
    },
    //设置已选
    _setSelected(ids) {
      //还要设置dataType
      let data_raw = JSON.parse(JSON.stringify(this.data_raw.datas));

      if (ids && ids.length) {
        let rights = [];
        let lefts = [];
        // console.log(ids);
        // console.log(data_raw);
        
        
        data_raw.map(item => {
          if (ids.indexOf(item.id) == -1) {
            lefts.push(item);
          } else {
            rights.push(item);
          }
        });

        //左边去除没有父级的子节点,
        for (let i = 0; i < lefts.length; i++) {
          if (
            lefts[i].parentId &&
            lefts.filter(item => {
              return item.id == lefts[i].parentId;
            }) == 0
          ) {
            lefts.splice(i, 1);
            i--;
          }
        }
        //左边去除没有子节点但元数据中存在子节点的节点
        lefts.sort((a, b) => {
          return Number(b.level) - Number(a.level);
        });
        for (let i = 0; i < lefts.length; i++) {
          if (lefts.filter(item => {return item.parentId == lefts[i].id;}) == 0 && this.data_raw.datas.filter(item => {return item.parentId == lefts[i].id;}) != 0) {
            lefts.splice(i, 1);
            i--;
          }
        }

        this.dataLeft = this.nestData(lefts, this.data_raw.maxLevel);

        //右边补全子节点的父节点,补全父节点的子节点
        for (let i = 0; i < rights.length; i++) {
          if (rights[i].level != 1) {
            if (
              rights.filter(item => {
                return item.id == rights[i].parentId;
              }).length == 0
            ) {
              let parent = data_raw.filter(_item => {
                return _item.id == rights[i].parentId;
              });
              if (parent.length) {
                rights.push(parent[0]);
              }
            }
          }
          if (
            rights.filter(item => {
              return item.parentId == rights[i].id;
            }).length == 0
          ) {
            let sons = data_raw.filter(item => {
              return item.parentId == rights[i].id;
            });
            if (sons.length) {
              rights.splice(rights.length, 0, ...sons);
            }
          }
        }
        this.dataRight = this.nestData(rights, this.data_raw.maxLevel);
      }
    },

    clearData(){
      this.dataLeft=[];
      this.dataRight= [];
      this.checkedLeft= [];
      this.checkedRight= [];
      this.data_raw= {};
      this.checkAll_left= false;
      this.checkAll_right= false;
      this.selected= [];
    },


    
    //对外，返回已选
    getSelected() {
      let nodes = this.getTreeNodes(this.dataRight);
      this.selected = nodes;

      let data_back = {
        type:this.data_type,
        data:nodes
      }
      // console.log(data_back);
      return data_back;
    },
    //对外,初始化,不需要外部传data,会根据配置url请求数据,1.有dataOptions的,根据配置的dataType请求,默认第一个;2.没有dataOptions的,直接请求配置url
    init(){
      //清数据据
      this.clearData();
      this.watchFlag = false;
      if(this.server){
        if(this.data_type){
          this.getRemoteData(this.data_type);
        }else if(this.dataOptions && this.dataOptions.length){
          this.getRemoteData(this.dataOptions[0].value);
        }else{
          this.getRemoteData();
        }
      }
    },
    //对外,带已选的初始化,1.根据传入的type请求;
    initWithSelected(data){
      //先初始化，
      //清数据据
      this.clearData();
      this.watchFlag = false;
      this.data_type = data.type;
      this.getRemoteData(data.type,()=>{
          this._setSelected(data.data);
          this.getSelected();
      });
    },
    //对外，设置已选
    setSelected(data){
      this.data_type = data.type;
      // console.log(data.data);
      
      this._setSelected(data.data);
      this.getSelected();
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  .ivu-transfer-list {
    width: 250px;
    height: 300px;
  }
  .filter {
    padding: 6px 0;
    display: inline-block;
    position: absolute;
    top: 0;
    right: 16px;
  }
  .ivu-transfer-list-header-title {
    padding-left: 0;
  }
  .selected_count {
    padding-right: 5px;
  }
  .treeNode {
    /deep/ .ivu-tree-empty {
      text-align: center;
    }
  }
}
</style>