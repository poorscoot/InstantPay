import React from 'react';
import {Button} from 'antd';
import BanksManager from './BanksManager';
import Transactions from './Transactions';

class Main extends React.Component{
  constructor(props) {
    super(props);
    this.show = this.show.bind(this);
    this.state = {transactions:false,accounts:false};
  }

    
componentDidMount(){
  if(JSON.parse(this.props.logged)){
  } else {
    window.location.href="/login";
  }
}

componentDidUpdate(prevProps, prevState, snapshot){
  if ((this.props.logged !== prevProps.logged)&&(!(JSON.parse(this.props.logged)))){
      window.location.href="/"
  }
}

show(tx,acc){
  if(tx){
    return(
      <div>
        <Button type="primary" onClick={()=>this.setState({transactions:false,accounts:false})}>
        Return
        </Button>
        <Transactions user={this.props.user}/>
      </div>
    )
  } else if (acc) {
    return(
      <div>
        <Button type="primary" onClick={()=>this.setState({transactions:false,accounts:false})}>
        Return
        </Button>
        <BanksManager/>
      </div>
    )
  } else {
    return(
      <div>
        <Button type="primary" onClick={()=>this.setState({transactions:true,accounts:false})}>
        Transactions
        </Button>
        <Button type="primary" onClick={()=>this.setState({transactions:false,accounts:true})}>
        Accounts
        </Button>
      </div>
    )
  }

}

  render(){
    return(
      <div>
        <p>{this.props.user}'s personal page</p>
        {this.show(this.state.transactions,this.state.accounts)}
      </div>
    );
  } 
}

export default Main;