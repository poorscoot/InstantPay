import React from 'react';
import {Row,Col, Button} from 'antd';

class AccountsBBVA extends React.Component{
  constructor(props) {
    super(props);
    this.state = {};
  }
//this.props.setTransactions
  render(){
    return(
      <div className="ListComponent">
        <Row type="flex">
            <Col><p>IBAN:{this.props.cuenta.iban}</p> <p>Balances: {this.props.cuenta.balances.map((item)=>{return <span>{item.balanceAmount.amount} {item.balanceAmount.currency}</span> })}</p></Col>
            <Col><Button type="primary" onClick={()=>{this.props.setTransactions(false,this.props.cuenta.resourceId,this.props.cuenta.iban,"Account transactions",this.props.bank)}}>Show transactions</Button></Col>
        </Row>
      </div>
    );
  } 
}

export default AccountsBBVA;