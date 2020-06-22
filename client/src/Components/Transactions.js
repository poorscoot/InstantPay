import React from 'react';
import axios from 'axios';
import {Button, Spin} from 'antd';

class Transactions extends React.Component{
  constructor(props) {
    super(props);
    this.reembolso = this.reembolso.bind(this);
    this.prevTwenty = this.prevTwenty.bind(this);
    this.nextTwenty = this.nextTwenty.bind(this);
    this.showSpinner= this.showSpinner.bind(this);
    this.state = {errorpwd:"",tx:[],page:0,buttonLeft:false, buttonRight:false,showSpin:true};
  }

  componentDidMount(){
    var that=this;
    axios.get('/tx?offset=0').then((response) => {
        if(response.status===200){
            that.setState({tx:response.data.tx,errorpwd:"",showSpin:false});
        } else {
            that.setState({errorpwd:"An error has ocurred, try again later.",showSpin:false});
        }
      })
      .catch(function (error) {
        console.log("Error");
        that.setState({errorpwd:"An error has ocurred, try again later.",showSpin:false});
      });
  }

  //TODO: Could just send the id and the bank-end should search for it in the DB
  reembolso(item){
    this.setState({errorpwd:""});
    var that=this;
    var user=this.props.user;
    axios.post('/pisp', {
      user: user,
      txid: item.id,
      amount:item.amount,
      destacc:item.debtor
    })
    .then((response) => {
      if(response.status===200){
        window.location.href=response.data.href;
        that.setState({errorpwd:""});
      }
    })
    .catch(function (error) {
      console.log("Error");
      that.setState({errorpwd:"The reinbursement has failed, try again later."});
    });
  }

  prevTwenty(){
    var that=this;
    var page = this.state.page;
    that.setState({tx:[],showSpin:true});
    if(page>0){
      var newpage=page-1;
      var offset = (page-1)*20;
      axios.get(`/tx?offset=${offset}`).then((response) => {
        if(response.status===200){
            that.setState({tx:response.data.tx,errorpwd:"",page:newpage,showSpin:false});
        } else {
            that.setState({errorpwd:"An error has ocurred, try again later.",showSpin:false});
        }
      })
      .catch(function (error) {
        console.log("Error");
        that.setState({errorpwd:"An error has ocurred, try again later.",showSpin:false});
      });
    } else {
      this.setState({errorpwd:"An error has ocurred, try again later.",showSpin:false});
    }
  }
  
  show(item){
    if(item.debtor!==undefined){
      return(
        <div>
          <p> Transaction ID: {item.id}<br/> Amount: {item.amount}<br/> Date: {item.date}<br/> Debtor: {item.debtor}</p>
          <Button type="primary" onClick={()=>{this.reembolso(item)}}>
          Reimburse
          </Button>
        </div>
        )
    }else{
      return(
        <div>
          <p> Transaction ID: {item.id}<br/> Amount: {item.amount}<br/> Date: {item.date}</p>
        </div>
      )
    }
  }

  //TODO: Should disable the next button when there are no more transactions
  nextTwenty(){
    var that=this;
    that.setState({tx:[],showSpin:true});
    if(this.state.tx.length>=20){
      var page = this.state.page;
      var newpage=page+1;
      var offset = (page+1)*20;
      axios.get(`/tx?offset=${offset}`).then((response) => {
        if(response.status===200){
            if(response.data.tx.length>0){
              that.setState({tx:response.data.tx,errorpwd:"",page:newpage,showSpin:false});
            } else {
              that.setState({errorpwd:"There are no more transactions.",showSpin:false});
            }
        } else {
            that.setState({errorpwd:"An error has ocurred, try again later.",showSpin:false});
        }
      })
      .catch(function (error) {
        console.log("Error");
        that.setState({errorpwd:"An error has ocurred, try again later.",showSpin:false});
      });
    } else {
      this.setState({errorpwd:"An error has ocurred, try again later.",showSpin:false});
    }
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
        <h1>Transactions</h1>
        {this.state.errorpwd}
        
        <h2>Transaction list:</h2>
        {this.showSpinner()}
        {this.state.tx.map((item,index)=>{
            return(
                <div className="ListComponent">
                    {this.show(item)}
                </div>   
            )
        })}
        <div>
          <Button type="primary" disabled={this.state.page===0} onClick={()=>{this.prevTwenty()}}>
            {'<'}
          </Button>
          {this.state.page}
          <Button type="primary" disabled={this.state.tx.length<20} onClick={()=>{this.nextTwenty()}}>
            {'>'}
          </Button>
        </div>
      </div>
    );
  } 
}

export default Transactions;