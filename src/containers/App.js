import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
//import { resetErrorMessage } from '../actions'

import Sidebar from '../components/Sidebar'

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <Sidebar />
                <div className="content pusher">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

App.propTypes = {
    // Injected by React Redux
    errorMessage: PropTypes.string,
    resetErrorMessage: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    inputValue: PropTypes.string.isRequired,

    // Injected by React Router
    children: PropTypes.node,

    location: PropTypes.string.isRequired
}

function mapStateToProps(state) {
    return {
        errorMessage: state.errorMessage,
        inputValue: state.router.location.pathname.substring(1)
    }
}

export default connect(mapStateToProps, {
    pushState
})(App)
