import React, {PropTypes} from 'react'

export const Loader = ({message}) => (
    <div className="loading-container">
        <div className="loading">
            <p>{message || 'Loading...'}</p>
        </div>
    </div>
)
Loader.propTypes = {message: PropTypes.string}
