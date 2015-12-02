import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { resetErrorMessage } from '../actions/errors'

import TicketsSidebarContainer from './TicketsSidebar'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.handleDismissClick = this.handleDismissClick.bind(this)
    }

    componentDidMount() {
        // Initialize semantic-ui dropdowns
        $('.ui.dropdown').dropdown()
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
                {this.props.sidebar || <TicketsSidebarContainer />}
                <div className="main-content pusher">
                    {this.renderErrorMessage()}
                    {this.props.content || this.props.children}
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

    // Injected by React Router
    children: PropTypes.node,

    sidebar: PropTypes.node,
    content: PropTypes.node
}

function mapStateToProps(state) {
    return {
        errorMessage: state.errorMessage
    }
}

export default connect(mapStateToProps, {
    resetErrorMessage,
    pushState
})(App)
