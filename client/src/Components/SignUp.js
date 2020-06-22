import React from 'react';
import { Form, Input, Button, Checkbox, Modal, Radio} from 'antd';
import crypto  from 'crypto';
import axios from 'axios';
import {Link} from 'react-router-dom';


class SignUp extends React.Component{
  constructor(props) {
    super(props);
    this.onRegister = this.onRegister.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.state = {errorpwd:"",logged:false,visible:false};
  }

  onRegister(values){
    if(values.password===values.password2){
      this.setState({errorpwd:""});
      axios.post('/register', {
        user: values.user,
        password: crypto.createHash('sha256').update(values.password).digest('base64'),
        bancos: values.bancos,
        email: values.email,
        depositaccount:values.bankaccount,
        prefaccbank:values.prefaccbank,
        redirecturi:values.redirecturi,
        shopid:values.shopid
      })
      .then(function (response) {
        if(response.status!==200){
          this.setState({errorpwd:"An error has ocurred, try again later."});
        } else {
            window.location.href="/login";
        }
      })
      .catch(function (error) {
        this.setState({errorpwd:"An error has ocurred, try again later."});
        console.log(error);
      });
    } else{
      this.setState({errorpwd:"The passwords don't match."});
    }
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

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
        <div>
        <Form {...layout} onFinish={this.onRegister}>
        <Form.Item name="user" label="User" rules={[{ required: true}]}>
          <Input />
        </Form.Item>
        <Form.Item
            label="Password"
            name="password"
            rules={[
            {
              required: true,
              message: 'Please input a password, minimum 8 characters.',
              min:8
            },
          ]}
        >
        <Input.Password />
        </Form.Item>
        <Form.Item
            label="Repeat your password:"
            name="password2"
            rules={[
            {
              required: true,
              message: 'Please input your password again',
            },
          ]}
        >
        <Input.Password />
        </Form.Item>
        <Form.Item name="email" label="E-mail" rules={[{ required: true }]}>
          <Input type="email" />
        </Form.Item>
        <Form.Item name="bankaccount" label="Deposit account" rules={[{ required: true, message :"This is not a valid IBAN"},
          ({ getFieldValue }) => ({
            validator(rule, value) {
              //IBAN checkers https://stackoverflow.com/questions/44656264/iban-regex-design
              function smellsLikeIban(str){
                return /^([A-Z]{2}[ \-]?[0-9]{2})(?=(?:[ \-]?[A-Z0-9]){9,30}$)((?:[ \-]?[A-Z0-9]{3,5}){2,7})([ \-]?[A-Z0-9]{1,3})?$/.test(str);
                }
            
              function validateIbanChecksum(iban) {       
                  const ibanStripped = iban.replace(/[^A-Z0-9]+/gi,'') //keep numbers and letters only
                                          .toUpperCase(); //calculation expects upper-case
                  const m = ibanStripped.match(/^([A-Z]{2})([0-9]{2})([A-Z0-9]{9,30})$/);
                  if(!m) return false;
                  
                  const numbericed = (m[3] + m[1] + m[2]).replace(/[A-Z]/g,function(ch){
                                        //replace upper-case characters by numbers 10 to 35
                                        return (ch.charCodeAt(0)-55); 
                                    });
                  //The resulting number would be to long for javascript to handle without loosing precision.
                  //So the trick is to chop the string up in smaller parts.
                  const mod97 = numbericed.match(/\d{1,7}/g)
                                          .reduce(function(total, curr){ return Number(total + curr)%97},'');
            
                  return (mod97 === 1);
                };
              if (smellsLikeIban(value)&&validateIbanChecksum(value)) {
                return Promise.resolve();
              }
              return Promise.reject('This is not a valid IBAN');
            },
          })
        ]}>
          <Input />
        </Form.Item>
        <Form.Item name="prefaccbank" label="Account bank" rules={[{ required: true, message :"Please, select a bank"}]}>
        <Radio.Group>
          <Radio value="BBVA">BBVA</Radio>
          <Radio value="Santander">Santander</Radio>
        </Radio.Group>
        </Form.Item>
        <Form.Item name="shopid" label="Payment identifier" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="redirecturi" label="Your redirection URI" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Banks">
        <Form.Item name="bancos"  valuePropName="checked" noStyle>
        <Checkbox.Group options={['BBVA', 'Santander']} />
        </Form.Item>
        </Form.Item>
        
        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject('You have to accept our privacy policy'),
            },
          ]}
          {...tailLayout}>
        <div><span><Checkbox>
        You have to review and accept our
        </Checkbox><a onClick={this.showModal}>privacy policy</a></span>
        </div>
      
      </Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Create account
          </Button>
          <Button
            type="primary">
            <Link to="/">
            Return
            </Link>
          </Button>
        </Form.Item>
      </Form>
      <div>{this.state.errorpwd}</div>
      <Modal
          title="Privacy policy"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <h2>Privacy policy</h2>
          <p>This site uses cookies and stores some information in order to provide its service.
            By accepting this privacy policy you give your consent for the next treatments:<br/>
            -Store the banking information you wish to access through this webpage<br/>
            -Use cookies in order to allow payments and other services to take place<br/>
            More precisely, the information stored will be the information you provide during registration,
             and the accounts and movements of these accounts that you access throught this platform.<br/>
            This information will be stored and will not used for any other intents and purposes.<br/>
            If you feel any of this is unlawful according to GDPR regulation, you may contact the <a href="https://www.aepd.es/es">AEPD</a> (ES).
          </p>
      </Modal>
      </div>
    );
  } 
}

export default SignUp;