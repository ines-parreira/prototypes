import React from 'react'
import PropTypes from 'prop-types'
import {FormFeedback} from 'reactstrap'

export default class Errors extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    }

    static defaultProps = {
        tag: FormFeedback,
    }

    render() {
        const {
            children,
            tag: Tag,
            ...rest
        } = this.props

        return (
            <Tag {...rest}>
                {children}
            </Tag>
        )
    }
}

