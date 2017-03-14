import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Entity} from 'draft-js'

// image render in draft js
class Image extends React.Component {
    static propTypes = {
        block: PropTypes.object.isRequired,
        className: PropTypes.string.isRequired,
        theme: PropTypes.object.isRequired,
    }

    static defaultProps = {
        className: '',
        theme: {},
    }

    render() {
        const {
            block,
            className,
            theme,
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
            ...elementProps
        } = otherProps

        const combinedClassName = classnames(theme.image, className)

        const {src} = Entity.get(block.getEntityAt(0)).getData()

        return (
            <img
                {...elementProps}
                src={src}
                role="presentation"
                className={combinedClassName}
            />
        )
    }
}

export default Image
