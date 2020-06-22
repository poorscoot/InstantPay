import React from 'react';
import { Form, Input, Button} from 'antd';
import crypto  from 'crypto';
import axios from 'axios';
import {Link} from 'react-router-dom';


class Login extends React.Component{
  
  constructor(props) {
    super(props);
    this.onLogin = this.onLogin.bind(this);
    this.state = {errorpwd:""};
  }

  onLogin(values){
    //crypto.createHash('sha256').update(values.password,"base64").digest('base64');
    this.setState({errorpwd:""});
    var hashed_password = crypto.createHash('sha256').update(values.password).digest('base64');
    var logear=this.props.changeLoginStatus;
    var setUser=this.props.setUser;
    var that=this;
    var {history} = this.props;
    axios.post('/login', {
      user: values.user,
      password: hashed_password
    })
    .then((response) => {
      if(response.status!==200){
          that.setState({errorpwd:"An error has ocurred, try again later."});
          logear(false);
      } else {
          logear(true);
          setUser(values.user);
          history.push("/main");
      }
    })
    .catch(function (error) {
      console.log("Error");
      that.setState({errorpwd:"An error has ocurred, try again later."});
    });
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
      <div>
        <Form {...layout} onFinish={this.onLogin}>
        <Form.Item name="user" label="User" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
            label="Password"
            name="password"
            rules={[
            {
              required: true,
              message: 'Please input your password',
            },
          ]}
        >
        <Input.Password />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Log-in
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
      </div>
    );
  } 
}

export default Login;