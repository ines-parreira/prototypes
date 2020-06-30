import React from 'react'
import PropTypes from 'prop-types'

export default class Errors extends React.Component {
    static propTypes = {
        belowInput: PropTypes.bool.isRequired,
        children: PropTypes.node,
        inline: PropTypes.bool.isRequired,
        tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    }

    static defaultProps = {
        belowInput: false,
        inline: false,
        tag: 'div',
    }

    render() {
        const {belowInput, children, inline, tag: Tag, ...rest} = this.props

        if (!children) {
            return null
        }

        if (inline) {
            return (
                <Tag className="d-inline-block text-danger ml-2" {...rest}>
                    {children}
                </Tag>
            )
        }

        const style = {}

        // if the error is displayed below an input, make some display adjustments
        if (belowInput) {
            style.marginTop = '-8px'
            style.marginBottom = '.5rem'
        }

        return (
            <Tag className="text-danger" style={style} {...rest}>
                {children}
            </Tag>
        )
    }
}
