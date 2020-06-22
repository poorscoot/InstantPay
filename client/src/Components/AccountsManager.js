import React from 'react';
import axios from 'axios';
import { Spin } from 'antd';
import AccountsBBVA from "./AccountsBBVA.js";
import AccountsSantander from "./AccountsSantander.js";

class AccountsManager extends React.Component{
  constructor(props) {
    super(props);
    this.showSpinner= this.showSpinner.bind(this);
    this.state = {banco:"",cuentas:[],error:"",showSpin:true};
  }
  
  componentDidMount(){
    var that=this;
    axios.post('/accounts', {
      bank: that.props.banco
    })
    .then((response) => {
      if(response.status!==200){
          that.setState({error:"An error has ocurred, try again later.",showSpin:false});
      } else {
          that.setState({cuentas:response.data.accs,showSpin:false})
      }
    })
    .catch(function (error) {
      that.setState({error:"An error has ocurred, try again later.",showSpin:false});
    });
  }

  showSpinner(){
    if(this.state.showSpin){
      return(<Spin />)
    } else {
      return null
    }
  }

  render(){
    return(
        <div>
        {this.state.error}
        {this.showSpinner()}
        {this.state.cuentas.map((item,index)=>{
            
              if(this.props.banco==="BBVA"){
                return(<AccountsBBVA cuenta={item} bank={this.props.banco} setTransactions={this.props.setTransactions}/>)
              } else if(this.props.banco==="Santander"){
                return(<AccountsSantander cuenta={item} bank={this.props.banco} setTransactions={this.props.setTransactions}/>)
              } else {
                return(null)
              }
        })}
        </div>
    );
  } 
}

export default AccountsManager;