import React, {PropTypes} from 'react'
import classnames from 'classnames'

export const DEFAULT_MESSAGE = 'Loading...'

export const Loader = ({message = DEFAULT_MESSAGE, loading = true, inline = false, inverted = false, size, className}) => {
    const classNames = classnames('ui', 'active', className, size, {
        inline,
        inverted,
        text: message && !inline
    }, 'loader')

    if (inline) {
        return <div className={classNames}></div>
    }
    let content = <div className={classNames}>{message}</div>

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

Loader.defaultProps = {
    loading: true,
    inverted: false,
    inline: false,
}

Loader.propTypes = {
    loading: PropTypes.bool.isRequired,
    inverted: PropTypes.bool.isRequired,
    className: PropTypes.string,
    inline: PropTypes.bool.isRequired,
    size: PropTypes.oneOf(['mini', 'tiny', 'small', 'medium', 'large']),
    message: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
}
