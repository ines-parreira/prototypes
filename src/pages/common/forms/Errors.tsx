import React, {Component, ComponentProps} from 'react'
import {FormFeedback} from 'reactstrap'

export default class Errors extends Component<
    ComponentProps<typeof FormFeedback>
> {
    render() {
        const {children, ...rest} = this.props

        return <FormFeedback {...rest}>{children}</FormFeedback>
    }
}
