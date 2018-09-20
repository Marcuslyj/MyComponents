v2.2
1.样式


v2.1
版本升级说明（具体使用查看示例）
1.可选参数参数统一放到config里；
2.添加单选多配置项；
3.添加是否显示已选择的配置项；
4.修改组件样式；
5.节点最小和宽度修改，border-box


v2.0
1.使用方法，引入组件并使用

<tree-selector :data="data_device" v-if="data_device" :format="select1"></tree-selector>
2.参数

2.1必要参数：data ，v-if

    2.1.1 data数据格式，包括最大层数maxLevel和一个一维数组
    {
        "maxLevel": 4,
        "datas": [
            {
                "name": "全国",
                "id": "0",
                "parentId": null,
                "level": "1"
            },
            {
                "name": "广东",
                "id": "01",
                "parentId": "0",
                "level": "2"
            },
            {
                "name": "深圳",
                "id": "011",
                "parentId": "01",
                "level": "3"
            },
            {
                "name": "南山",
                "id": "0111",
                "parentId": "011",
                "level": "4"
            },
            {
                "name": "福田",
                "id": "0112",
                "parentId": "011",
                "level": "4"
            },
            {
                "name": "罗湖",
                "id": "0113",
                "parentId": "011",
                "level": "4"
            },
            {
                "name": "广州",
                "id": "012",
                "parentId": "01",
                "level": "3"
            },
            {
                "name": "珠海",
                "id": "013",
                "parentId": "01",
                "level": "3"
            },
            {
                "name": "佛山",
                "id": "014",
                "parentId": "01",
                "level": "3"
            },
            {
                "name": "东莞",
                "id": "015",
                "parentId": "01",
                "level": "3"
            },
            {
                "name": "江苏",
                "id": "02",
                "parentId": "0",
                "level": "2"
            },
            {
                "name": "南京",
                "id": "021",
                "parentId": "02",
                "level": "3"
            },
            {
                "name": "无锡",
                "id": "022",
                "parentId": "02",
                "level": "3"
            },
            {
                "name": "泰州",
                "id": "023",
                "parentId": "02",
                "level": "3"
            },
            {
                "name": "北京",
                "id": "03",
                "parentId": "0",
                "level": "2"
            },
            {
                "name": "上海",
                "id": "04",
                "parentId": "0",
                "level": "2"
            },
            {
                "name": "福建",
                "id": "05",
                "parentId": "0",
                "level": "2"
            },
            {
                "name": "厦门",
                "id": "051",
                "parentId": "05",
                "level": "3"
            },
            {
                "name": "福州",
                "id": "052",
                "parentId": "05",
                "level": "3"
            }
        ]
    }
2.2可选参数
:format，用于格式化已选择，此属性参数可不传
{
    allParents:true,//默认只显示上一父节点加当前节点，设为TRUE，则以所有父节点作为前缀；
    noTop:true//设为true，父节点前缀排除第一层级的父节点
}

3.有已选择
:selected="",把已选择的id数组传进去