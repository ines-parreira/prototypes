import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { resetErrorMessage } from '../actions/errors'

import Sidebar from '../components/Sidebar'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.handleDismissClick = this.handleDismissClick.bind(this)
    }

    handleChange(nextValue) {
        this.props.pushState(null, `/${nextValue}`)
    }

    handleDismissClick(e) {
        e.preventDefault()
        this.props.resetErrorMessage()
    }

    renderErrorMessage() {
        const { errorMessage } = this.props
        if (!errorMessage) {
            return null
        }

        return (
            <p style={{ backgroundColor: '#e99', padding: 10 }}>
                <strong>{errorMessage}</strong>
                {' '}
                (<a href="#"
                    onClick={this.handleDismissClick}>
                Dismiss
            </a>)
            </p>
        )
    }

    render() {
        return (
            <div className="App">
                {this.renderErrorMessage()}
                <Sidebar />
                <div className="main-content pusher">
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
    children: PropTypes.node
}

function mapStateToProps(state) {
    return {
        errorMessage: state.errorMessage,
        inputValue: state.router.location.pathname.substring(1)
    }
}

export default connect(mapStateToProps, {
    resetErrorMessage,
    pushState
})(App)
