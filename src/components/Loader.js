import React, { PropTypes } from 'react'

export default class Loader extends React.Component {

    render() {
        if (!this.props.loaded) {
            return (
                <div className="loading-container">
                    <div className="loading">
                        <p>{this.props.message || 'Loading...'}</p>
                    </div>
                </div>
            )
        }

        return Array.isArray(this.props.children) ? <div>{this.props.children}</div> : this.props.children
    }
}

Loader.propTypes = {
    loaded: PropTypes.bool.isRequired,
    message: PropTypes.string
}