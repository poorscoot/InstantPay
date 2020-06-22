import React from 'react';
import axios from 'axios';
import { Spin } from 'antd';
import Bank from './Bank';
import BankTransactions from './BankTransactions';

class BanksManager extends React.Component{
  constructor(props) {
    super(props);
    this.show = this.show.bind(this);
    this.showSpinner= this.showSpinner.bind(this);
    this.setTransactions = this.setTransactions.bind(this);
    this.state = {banks:[],showbanks:true,iban:"",rid:"",title:"Accounts",txBank:"",showSpin:true};
  }

  componentDidMount(){
    var that=this;
    axios.get('/banks').then((response) => {
        if(response.status===200){
            that.setState({banks:response.data.banks,showSpin:false});
        } else {
            that.setState({errorpwd:"An error has ocurred, please try again later.",showSpin:false});
        }
      })
      .catch(function (error) {
        console.log("Error");
      });
  }

  setTransactions(showvar,id,iban,title,bank){
    this.setState({showbanks:showvar,rid:id,iban:iban,title:title,txBank:bank});
  }
  
  show(showvar){
    if(JSON.parse(showvar)){
      return(this.state.banks.map((item,index)=>{
        return(
            <Bank id={item.bank} auth={item.auth} setTransactions={this.setTransactions}/>  
        )
      }))
    } else{
      return (<BankTransactions bank={this.state.txBank} rid={this.state.rid} iban={this.state.iban} setTransactions={this.setTransactions}/>)
    }
  }

  showSpinner(){
    if(this.state.showSpin){
      return(<Spin />)
    } else {
      return null
    }
  }

  //Paginar en servidor, juntar los dos bancos
  render(){
    return(
        <div>
        <h1>{this.state.title}</h1>
        {this.showSpinner()}
        {this.show(this.state.showbanks)}
        </div>
    );
  } 
}

export default BanksManager;