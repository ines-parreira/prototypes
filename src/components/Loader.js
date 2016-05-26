import React, {PropTypes} from 'react'

export const Loader = ({message}) => (
    <div className="loading-container">
        <div className="loading">
            <div className="ui active text loader">{message || 'Loading...'}</div>
        </div>
    </div>
)
Loader.propTypes = {message: PropTypes.string}
