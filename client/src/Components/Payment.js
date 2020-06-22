import React from 'react';
import { Form,  Button, Radio, Layout} from 'antd';
import axios from 'axios';


class Payment extends React.Component{
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.state = {serviceSVA:true,afterpayment:false,status:"",bankid:"",storeid:"",amount:""};
  }

  componentDidMount(){
    axios.get(`/checkservice`).then(msg=>{
      if(msg.data.service==="SVA"){
        this.setState({serviceSVA:true});
      } else if(msg.data.service==="payment"){
        this.setState({serviceSVA:false});
      }else if(msg.data.service==="post"){
        this.setState({afterpayment:true,status:msg.data.status,bankid:msg.data.bankid,storeid:msg.data.storeid,amount:msg.data.amount});
      } else {
        axios.get(`/logout`);
        window.location.href="/"
      }
    }).catch(function (error) {
      axios.get(`/logout`);
      window.location.href="/"
    });
  }

  logout(){
    if(this.state.afterpayment){
      axios.get(`/endpayment`).then(msg=>{
        window.location.href=msg.data.href
      }).catch(function (error) {
        console.log("Error")
        axios.get(`/logout`);
        window.location.href="/"
      });
    }else{
      axios.get(`/logout?step=pay`).then(msg=>{
        window.location.href=msg.data.href
      }).catch(function (error) {
        console.log("Error")
        axios.get(`/logout`);
        window.location.href="/"
      });
    }
    
  }

  onSelect(values){
    this.setState({errorpwd:""});
    if(this.state.serviceSVA){
      window.location.href=`/payment?bank=${values.bank}`;
    } else {
      window.location.href=`/payment`;
    }
  }

  show(){
    if(this.state.afterpayment){
      if(this.state.status==="success"){
        return(
          <div>
          <p>Welcome back to InstantPay!<br/>
          The payment was a success!<br/>
          Amount: {this.state.amount} plus any amount the bank may have charged<br/>
          Bank payment identifier:{this.state.bankid}<br/>
          Store payment identifier:{this.state.storeid}<br/><br/></p>
          <Form  onFinish={this.onSelect}>
          <Form.Item>
            <Button type="primary" onClick={this.logout}>
              End payment process
            </Button>
          </Form.Item>
          </Form>
          </div>
        )
      } else{
        return(
          <div>
          <p>Welcome back to InstantPay!<br/>
          The payment could not be executed<br/>
          Bank payment identifier:{this.state.bankid}<br/>
          Store payment identifier:{this.state.storeid}<br/><br/></p>
          <Form  onFinish={this.onSelect}>
          <Form.Item>
            <Button type="primary" onClick={this.logout}>
              End payment process
            </Button>
          </Form.Item>
          </Form>
          </div>
        )
      }
    }else{
      if(this.state.serviceSVA){
        return(
          <div>
          <p>Welcome to InstantPay!<br/>
          The payment you're about to execute is executed in a matter of minutes<br/>
          This platform does not charge you for the service it provides<br/>
          In order to proceed, choose your bank, check the privacy policies<br/>
          and press submit.<br/><br/>
          In case you need to contact us, use our email: instantpay@instantpay.es<br/>
          Or our physical address: placeholder<br/>
          In Spain, the local authority is the BDE: <a href="https://www.bde.es/bde/es/">BDE</a><br></br>
          This webpage uses cookies in order to provide the payment service,<br/>
          these cookies will be deleted once the payment has been processed,<br/>
          but some information, such as your bank account, will be stored in order<br/>
          to allow the store to reimburse you.<br/>
          If you do not agree with these requirements, feel free to press cancel,<br/>
          you will be redirected back to the store. If you feel this is unlawful<br/>
          based on the GDPR, you can contact the <a href="https://www.aepd.es/es">AEPD</a> (ES).</p>
          <Form  onFinish={this.onSelect}>
          <Form.Item name="bank" label="Bank" rules={[{ required: true, message :"Please, select a bank"}]}>
          <Radio.Group>
            <Radio value="BBVA">BBVA</Radio>
            <Radio value="Santander">Santander</Radio>
          </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button type="primary" onClick={this.logout}>
              Cancel
            </Button>
          </Form.Item>
          </Form>
          </div> 
        )
      } else {
        return(
          <div>
          <p>Welcome to InstantPay!<br/>
          The payment you're about to execute is executed in a matter of minutes<br/>
          This platform does not charge you for the service it provides<br/>
          In order to proceed, check the privacy policies and press submit.<br/><br/>
          This webpage uses cookies in order to provide the payment service,<br/>
          these cookies will be deleted once the payment has been processed,<br/>
          but some information, such as your bank account, will be stored in order<br/>
          to allow the store to reimburse you.<br/>
          If you do not agree with these requirements, feel free to press cancel,<br/>
          you will be redirected back to the store. If you feel this is unlawful<br/>
          based on the GDPR, you can contact the <a href="https://www.aepd.es/es">AEPD</a> (ES).</p>
          <Form  onFinish={this.onSelect}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button type="primary" onClick={this.logout}>
              Cancel
            </Button>
          </Form.Item>
          </Form>
          </div>
        )
      }
    } 
  }

  render(){
    const layout = {
        labelCol: {
          span: 12,
        },
        wrapperCol: {
          span: 12,
        },
    };
    const tailLayout = {
        wrapperCol: {
          offset: 7,
          span: 17,
    },
    };
    return(
      <Layout>
      {this.show()}
      <div>{this.state.errorpwd}</div>
      </Layout>
    );
  } 
}

export default Payment;