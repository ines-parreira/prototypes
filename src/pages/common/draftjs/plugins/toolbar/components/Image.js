import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

// image render in draft js
class Image extends React.Component {
    static propTypes = {
        alt: PropTypes.string.isRequired,
        block: PropTypes.object.isRequired,
        contentState: PropTypes.object.isRequired,
        className: PropTypes.string.isRequired,
        theme: PropTypes.object.isRequired,
    }

    static defaultProps = {
        className: '',
        theme: {},
    }

    render() {
        const {
            alt,
            block,
            className,
            theme,
            contentState,
            ...otherProps
        } = this.props

        // leveraging destructuring to omit certain properties from props
        const {
            blockProps, // eslint-disable-line no-unused-vars
            customStyleMap, // eslint-disable-line no-unused-vars
            customStyleFn, // eslint-disable-line no-unused-vars
            decorator, // eslint-disable-line no-unused-vars
            forceSelection, // eslint-disable-line no-unused-vars
            offsetKey, // eslint-disable-line no-unused-vars
            selection, // eslint-disable-line no-unused-vars
            tree, // eslint-disable-line no-unused-vars
            blockStyleFn, // eslint-disable-line no-unused-vars
            ...elementProps
        } = otherProps

        const combinedClassName = classnames(theme.image, className)

        const {src} = contentState.getEntity(block.getEntityAt(0)).getData()

        return (
            <img
                alt={alt}
                {...elementProps}
                src={src}
                role="presentation"
                className={combinedClassName}
            />
        )
    }
}

export default Image
