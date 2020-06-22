import React from 'react';
import logo from './logo.png';
import './App.css';
import { Row, Col, Button, Modal} from 'antd';
import { BrowserRouter as Router , Switch, Route} from 'react-router-dom';
import Home from './Components/Home';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import Main from './Components/Main';
import Payment from './Components/Payment';
import { withCookies, Cookies } from 'react-cookie';
import axios from 'axios';

class App extends React.Component{
  constructor(props) {
    super(props);
    const { cookies } = props;
    this.changeLoginStatus = this.changeLoginStatus.bind(this);
    this.setUser = this.setUser.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleCookieOk = this.handleCookieOk.bind(this);
    this.handleCookieCancel = this.handleCookieCancel.bind(this);
    this.showUnlogButton = this.showUnlogButton.bind(this);
    this.state = {logged:cookies.get('logged') || false, username:cookies.get('username') || '',error:"",visible: false,cookiesvisible:cookies.get('cookies') || true};
  }

  componentDidMount(){
    var that = this;
    axios.get(`/logged`).catch(function (error) {
      const { cookies } = that.props;
        that.changeLoginStatus(false);
        that.setUser("");
    });
  }

  changeLoginStatus(status){
    const { cookies } = this.props;
    this.setState({logged:status});
    cookies.set("logged", status);
  }

  setUser(user){
    const { cookies } = this.props;
    this.setState({username:String(user)});
    cookies.set("username", user);
  }

  showUnlogButton(){
   if(JSON.parse(this.state.logged)){
     return(
      <Row>
        <Col><Button type ="primary" onClick={this.showModal}>Configuration</Button></Col>
        <Col><Button type ="primary" onClick={
        ()=>{
        axios.get(`/logout`).then((response) => {
          if(response.status===200){
            this.changeLoginStatus(false);
            this.setUser("");
          } else{
            this.setState({error:"Log-out failed!"});
          }
        })
        .catch(function (error) {
          this.setState({error:"Log-out failed!"});
        });
        }}>Log-out</Button></Col>
      </Row>
     )
   } else {
     return null
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

  //TODO: Should modify back-end in order to use cookies
  handleCookieOk = e => {
    console.log(e);
    const { cookies } = this.props;
    cookies.set("cookies", false);
    this.setState({
      cookiesvisible: false,
    });
  };

  //TODO: Should modify back-end in order to not use non-fundamental cookies
  handleCookieCancel = e => {
    console.log(e);
    this.setState({
      cookiesvisible: false,
    });
  };

  render(){
    return(
      <div className="App">
        <Row className="Header">
          <Col span={1}></Col>
          <Col ><img className ="Logo" src={logo}/></Col>
          <Col ><h1>InstantPay</h1></Col>
          <Col >Welcome to the future of banking!</Col>
          <Col >{this.state.error}</Col>
          <Col span={4}>{this.showUnlogButton()}</Col>
          <Col span={1}></Col>
        </Row>
        <header className="App-header">
          <Router>
          <Switch>
            <Route path="/payments" component={Payment}/>
            <Route path="/main" render={(props) => <Main {...props} logged={this.state.logged} user={this.state.username}/>}/>
            <Route path="/login" render={(props) => <Login {...props} changeLoginStatus={this.changeLoginStatus} setUser={this.setUser}/>}/>
            <Route path="/register" component={SignUp}/>
            <Route path="/" render={(props) => <Home {...props} logged={this.state.logged}/>}/>
          </Switch>
        </Router>
        </header>
        <Modal
          title="Configuration"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <p>Form that allows to modify account data</p>
          <p>Button that allows to delete the account after asking for the password</p>
          <p>Link to the privacy policy</p>
        </Modal>
        <Modal
          title="Cookies"
          visible={JSON.parse(this.state.cookiesvisible)}
          onOk={this.handleCookieOk}
          onCancel={this.handleCookieCancel}
        >
          <p>This service uses cookies in order to make it easier to use.</p>
          <p>You can check our <a>Privacy policy</a> in order to obtain more information.</p>
          <p>Press OK if you allow the use of cookies.</p>
        </Modal>
      </div>
    );
  } 
}

export default withCookies(App);