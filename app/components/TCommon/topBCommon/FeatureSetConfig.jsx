/***  官方官方组件   ***/
import React from 'react'; //官方组件
import ReactEcharts from 'echarts-for-react';  //echart引入
/***  react 相关 antd第三方 UI库  ***/
import { Table, Form, Select, Row, Col, Button, Icon, Popconfirm, DatePicker, TimePicker, Radio, Switch, message, Tooltip } from 'antd';
import { Link } from 'dva/router';

/***  react 第三方 数据处理函数库  ***/
import Immutable from 'immutable';

/***  自定义组件库  ***/
import { DoTopgo, DoToparrived } from './ProgressHandler';

import CFormItem from './CreateFormItem';
import CTextItem from './CreateTextItem';
import Expand from './Expandtable';
import Senior from './Seniortable';
import Tiltle from './Tiltle/Tiltle';

// 搜索查询栏form 创建新item-form 更新form
import UForm from './UpdateForm';
import CForm from './CreateForm';
import RForm from './RetrieveForm';
import CDrop from './CreatedDropd';
import './Common.less'

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

// 依赖 config 主题生成react 组件函数
const FeatureSet = (config) => {
    let ExpandFeature = (props) => {
      return (
          <Expand config={config} />
      )
    }

    let SeniorFeature = (props) => {
      return (
          <Senior config={config} />
      )
    }


    let tableFeature = React.createClass({
        getInitialState: function(){
            return {
              columns: [],
              resultList: [],
              loading: false,
              updateFromShow: false,
              updateFromItem: {},
              size: config.size ? config.size : 'middle', //table尺寸发小
              total: 0,
              pageSize: 10,
              isSlider: this.props.isSlider,
              isUpdate: this.props.isUpdate
            }
        },

        componentWillMount: function() {
            DoTopgo()
            this.setState({
                loading: true,
                columns: this.dealConfigColumns(config.columns)
            });
        },

        render: function() {
            const self = this

            let table

            /**
                table多列设置
            */
            if(config.mergeRowHead>1){

                this.state.columns[0].render = function (value, row, index)
                {
                    const obj = {
                      children: value,
                      props: {},
                    };

                    if ((index)%(config.mergeRowHead) === 0) {
                          obj.props.rowSpan = config.mergeRowHead;
                      }else{
                          obj.props.colSpan = 0;
                      }

                    return obj;
                }
            }

            if (config.pageData) {
                const pagination = {
                    total: this.state.total,
                    pageSize: this.state.pageSize,
                    onChange: function(num){
                        self.setState({
                            loading: true
                        })
                        self.getpageData(num)
                    }
                }
                table = <Table {...this.state} dataSource={this.state.resultList} columns={this.state.columns} loading={this.state.loading} pagination={pagination} />;
            } else {
                table = <Table {...this.state} dataSource={this.state.resultList} columns={this.state.columns} loading={this.state.loading} onChange={config.columnSoft}/>;
            }

            return  <div className={this.props.className} >
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', margin: '0.5% 0% 10px', borderBottom: '1.6px solid #e8e8e8', padding: '6px 0 6px' }}>
                          <span style={{ flexGrow: '1' }}><Tiltle typeIcon={'table'} centent={config.tableTiltle || '查询列表'}/></span>
                          <CDrop CDropD={config.CDropD} />
                          <RForm RType={config.RType} submit={self.handleRetrieve} />
                          <CForm CType={config.CType} submit={self.handleCreate} />
                          <UForm UType={config.UType} submit={self.handleUpdate} isShow={this.state.updateFromShow} updateItem={this.state.updateFromItem} hideForm={this.hideUpdateForm}/>
                      </div>
                      {table}
                      <div style={{clear:'both'}}></div>
                    </div>
        },

        // 预处理配置显示中的 colums 数据 用于anted的table配置
        dealConfigColumns: function(lists){
            const self = this;

            let columns = [];
            lists.forEach((item) => {
                let column = {
                    title: item.title,
                    dataIndex: item.dataIndex,
                    key: item.dataIndex,
                    width: item.width
                }

                if( item.type === 'operate' ){
                    // 兼容单一形式与数组形式
                    let btns = Array.isArray(item.btns)?item.btns:[item.btns];

                    // 处理表单 操作 栏目以及回调函数
                    column.render = item.render || function(txt, record){
                        return <span>
                                {
                                    btns.map(function(btn,i) {
                                        if( btn.text ){
                                            if(btn.type != 'delete') {
                                                return  (
                                                    <span key={i}>
                                                        <Tooltip placement="right" title={btn.text}>
                                                            <a href="javascript:void 0;" onClick={self.operateCallbacks.bind(self, record, btn)}> { btn.icon ? <Icon type={btn.icon} /> : btn.text } </a>
                                                        </Tooltip>
                                                        {i!==btns.length-1?<span className="ant-divider"></span>:''}
                                                    </span>
                                                )
                                            }
                                            return  (
                                                <span key={i}>
                                                    <Popconfirm title="确定要删除此记录?" onConfirm={self.operateCallbacks.bind(self, record, btn)} okText="确定" cancelText="取消">
                                                        <Tooltip placement="right" title={btn.text}>
                                                            <a href="javascript:void 0;"> { btn.icon ? <Icon type={btn.icon} /> : btn.text } </a>
                                                        </Tooltip>
                                                    </Popconfirm>
                                                    {i!==btns.length-1?<span className="ant-divider"></span>:''}
                                                </span>
                                            )
                                        }else if( btn.render ){
                                            return (
                                                <span key={i}>
                                                    {btn.render(txt, record)}
                                                    {i!==btns.length-1?<span className="ant-divider"></span>:''}
                                                </span>
                                            );
                                        }
                                    })
                                }
                                </span>
                    };
                }else if( !item.dataIndex ){    //表单排序
                    item.dataIndex = 'NORMAL_INDEX';
                    column.render = item.render || self.renderFunc[item.type];
                } else {
                    column.render = item.render || self.renderFunc[item.type] || ((text) => (<span>{text}</span>));
                }

                if( item.type === 'sort' ){
                    column.sorter = item.sorter || ((a, b) => a[item.dataIndex] - b[item.dataIndex]);
                }
                columns.push(column);

            });

            return columns;

        },

        // columns 类型对应的通用痛render
        renderFunc: {
            link: (text) => (
                    <span>
                        <a href={text}>{text}</a>
                    </span>),

            image: (url) => (
                    <span>
                        <img src={url} />
                    </span>)
        },

        handleSelect: function(selectedKeys, subtitle) {
            const self = this
            config.uProductCategoryUUID = selectedKeys[0]
            global.slidertitle = subtitle
            self.getpageData(1)
        },

        handleCreate: function(info){
            const self = this;
            config.Create(info, function(item){
              // 初级接口的坑
              if(!item){
                config.initData(function(list){
                  self.setState({
                      loading: false,
                      resultList: list
                  })
                })
                return
              }

              self.state.resultList.unshift(item);

              let result = Immutable.fromJS(self.state.resultList)

              let resultList = result.map( function(v, i) {
                if (v.get('key') == item.key) {
                  return Immutable.fromJS(item)
                } else {
                  return v
                }
              })
              self.setState({
                loading: false,
                resultList: resultList.toJS()
              })
            })
        },

        handleUpdate: function(info){
          const self = this;
          let result = Immutable.fromJS(self.state.resultList);
          let infoN = Immutable.fromJS(self.state.updateFromItem).merge(info).toJS();
          config.Update(infoN, function (item) {
            let resultList = result.map( function(v, i) {
              if(v.get('key') == item.key){
                return Immutable.fromJS(item)
              } else {
                return v
              }
            })

            message.success('更新成功')

            self.setState({
              loading: false,
              updateFromShow: false,
              resultList: resultList.toJS()
            })
          })

          if(info.hasOwnProperty('uploadImg')){
              config.UpdateImage( infoN, function ( item ) {
                  /*let resultList = result.map( function ( v, i ) {
                      if ( v.get( 'key' ) == item.key ) {
                          return Immutable.fromJS( item )
                      }
                      else return v;
                  } );
                  self.setState( {
                      loading: false,
                      updateFromShow: false,
                      resultList: resultList.toJS()
                  } );*/
                  self.getpageData();
                  // message.success( '更新成功!' );
              } );
          }

        },

        hideUpdateForm: function(){
          this.setState({
            updateFromShow: false,
            updateFromItem: {}
          })
        },

        // 搜索更新处理
        handleRetrieve: function(info){
          const self = this;
          self.setState({
            loading: true
          })

          config.Retrieve(info, function(list){
            self.setState({
              loading: false,
              resultList: list
            })
          })
        },

        // table 操作列回调处理
        operateCallbacks: function(item, btn){
            const self = this;

            if(btn.type){

                let resultList;
                let type = btn.type;
                let itemI = Immutable.fromJS(item);
                let result = Immutable.fromJS(self.state.resultList);

                // table 操作栏目通用设定为 更新与删除 两项
                if(type === 'update'){
                  this.setState({
                    updateFromShow: true,
                    updateFromItem: itemI.toJS()
                  });
                } else if(type === 'delete') {
                    this.setState({
                      loading: true
                    })
                    config.Delete(itemI.toJS(), function(){
                      resultList = result.filter(function(v, i){
                        if(v.get('key') !== itemI.get('key')){
                          return true;
                        }
                      })
                      message.success('删除成功');
                      self.setState({
                        loading: false,
                        resultList: resultList.toJS()
                      })
                    })
                } else if(type === 'bind') {
                  this.setState({
                    loading: true
                  })
                  config.bind(itemI.toJS(), function(isSucce){
                    isSucce ? message.success('添加成功') : message.error('添加失败')
                    self.setState({
                      loading: false,
                    })
                  })
                }

            }else if(btn.callback){
                btn.callback(item);
            }
        },

        componentDidMount: function(){
            const self = this
            DoToparrived()
            // 处理接口分页的逻辑
            if(config.pageData){
                self.getpageData(1);
            }else{ // 处理 前端分页的逻辑
                config.initData(function(list){
                    self.setState({
                        loading: false,
                        resultList: list
                    })
                })
            }
        },

        shouldComponentUpdate: function (nextProps, nextState){
            const self = this
            return true
        },

        componentWillUpdate() {
          const self = this
          // 处理接口分页的逻辑
          // {if(config.pageData){
          //     self.getpageData(1);
          // }else{ // 处理 前端分页的逻辑
          //     config.initData(function(list){
          //         self.setState({
          //             loading: false,
          //             resultList: list
          //         });
          //     });
          // }}
        },

        getpageData: function(num){
            const self = this
            self.setState({
              loading: true
            })

            config.pageData(num,function(list, info){
                self.setState({
                    loading: false,
                    resultList: list,
                    total: info.total,
                    pageSize: info.nPageSize || 10,
                })
            })
        }

    });

    let simpleFeature = React.createClass({
        getInitialState: function(){
            return {
                item:{},
                loading: false,
                updateFromShow: false,
                updateFromItem: {}
            }
        },

        componentWillMount: function(){
        },

        render: function() {
            const self = this;
            const itemInfo = this.state.item;

            const { getFieldDecorator } = this.props.form;
            const formItemLayout = {
                labelCol: { span: 3 },
                wrapperCol: { span: 18 },
            };

            const operate = config.operate || [];

            return  <div className={this.props.className}>
                        <Form layout="horizontal" className='p-relative'>
                            {
                                this.state.loading?
                                    <div className="formLayout">
                                        <Spin tip="Loading..." size="large" style={{"marginTop":"50px"}} />
                                    </div>:
                                    ''
                            }
                            {
                                config.columns?
                                    config.columns.map(function(item){
                                        item.value = itemInfo[item.dataIndex]||'';
                                        return <CTextItem key={item.dataIndex} formItemLayout={formItemLayout} item={item}/>
                                    }):
                                    ''
                            }
                            {
                                config.UType?
                                    config.UType.map(function(item){
                                        item.defaultValue = itemInfo[item.name]||'';
                                        return <CFormItem key={item.name} getFieldDecorator={getFieldDecorator} formItemLayout={formItemLayout} item={item}/>
                                    }):
                                    ''
                            }
                        </Form>
                        {
                            operate.map(function(btn){
                                return <Button key={btn.text} type="primary" size="large" onClick={self.operateCallbacks.bind(self, btn)} style={btn.style}>{btn.text}</Button>
                            })
                        }
                    </div>
        },

        componentDidMount: function(){
            const self = this;
            self.setState({
                loading: true
            });

            config.initData(function(item){
                self.setState({
                    item: item,
                    loading: false
                });
            });
        },

        operateCallbacks: function(btn){
            const self = this;

            let itemI = Immutable.fromJS(this.props.form.getFieldsValue());

            if(btn.type === 'update'){
                const self = this;

                config.Update(itemI.toJS(), function(item){
                    message.success('更新成功');
                    self.setState({
                        item: item
                    });
                });

            }else if(btn.callback){
                btn.callback(itemI.toJS());
            }
        }

    })

    simpleFeature = Form.create()(simpleFeature);

    let graphFeature = React.createClass({
        getInitialState: function(){
            return {
                option: false
            }
        },

        componentWillMount: function(){},

        render: function() {
            const self = this;
            const itemInfo = this.state.item;

            const operate = config.operate || [];
            return  <div className={this.props.className}>
                        {this.state.option?
                        <ReactEcharts
                            option={this.state.option}
                            style={config.EchartStyle}
                            className='react_for_echarts' />:
                        ''}
                    </div>
        },

        componentDidMount: function(){
            const self = this;

            config.initData(function(option){
                 self.setState({
                    option : option
                 });
            });
        }
    });

    switch (config.type){
        case 'tableList':
            return tableFeature;
            break;

        case 'graphList':
            return graphFeature;
            break;

        case 'simpleObject':
            return simpleFeature;
            break;

        case 'complexObject':
            return complexFeature;
            break;
        case 'Expandtable':
            return ExpandFeature;
            break;
        case 'Seniortable':
            return SeniorFeature;
            break;
        default:
            return tableFeature;
            break;
    }
}

export default FeatureSet;