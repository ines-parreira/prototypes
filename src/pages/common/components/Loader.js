import React, {PropTypes} from 'react'

export const DEFAULT_MESSAGE = 'Loading...'

export const Loader = ({message, loading = true}) => {
    let content = <div className="ui active text loader">{message || DEFAULT_MESSAGE}</div>

    if (!loading) {
        content = message || DEFAULT_MESSAGE
    }

    return (
        <div className="loader-container">
            <div className="loader-inner">
                {content}
            </div>
        </div>
    )
}

Loader.propTypes = {
    loading: PropTypes.bool,
    message: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
}
