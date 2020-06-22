import React from 'react';
import {Button} from 'antd';
import AccountsManager from './AccountsManager';

class Bank extends React.Component{
  constructor(props) {
    super(props);
    this.state = {};
  }

  show(auth,id){
    if(!auth){
      return(
        <div>
          <Button type="primary" onClick={()=>{this.authBanco(id)}}>
          Log-in to the bank
          </Button>
        </div>
      )
    } else {
      return(
        <div>
          <AccountsManager banco={id} setTransactions={this.props.setTransactions}/>
        </div>
      )
    }
  
  }

  authBanco(id){
    window.location.href=`/bankAuth?bank=${id}`
  }

  //Paginación en server, cada vez que pulsas, las siguientes 20
  render(){
    return(
        <div>
        {this.props.id}
        {this.show(this.props.auth,this.props.id)}
      </div>
    );
  } 
}

export default Bank;