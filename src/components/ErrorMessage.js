import React from 'react'

class ErrorMessage extends React.Component {
    render() {
        if (this.props.error) {
            return (
                <div className="ui sticky negative message">
                    <i className="close icon"></i>

                    <div className="header">
                        An error occured
                    </div>
                    <p>{ this.props.error }</p>
                </div>
            )
        } else {
            return <div />
        }
    }
}

export default ErrorMessage
