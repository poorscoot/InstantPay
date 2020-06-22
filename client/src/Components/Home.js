import React from 'react';
import {Button} from 'antd';
import {Link} from 'react-router-dom';


class Home extends React.Component{
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount(){
    if(JSON.parse(this.props.logged)){
      window.location.href="/main"
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot){
    if ((this.props.logged !== prevProps.logged)&&(JSON.parse(this.props.logged))){
        window.location.href="/main"
    }
  }

  render(){
    return(
        <div>
        <div>
        <Button
          type="primary"
        >
            <Link to="/login">
            Log-in
            </Link>
        </Button>
        </div>
        <div>
        <Button
          type="primary"
        >
            <Link to="/register">
            Create account
            </Link>
        </Button>
        </div>
        </div>
    );
  } 
}

export default Home;