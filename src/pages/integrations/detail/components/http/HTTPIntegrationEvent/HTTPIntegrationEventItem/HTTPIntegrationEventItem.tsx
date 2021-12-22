import React, {Component, ReactNode} from 'react'

type Props = {
    name: string
    value?: any
    children?: ReactNode
}

export default class HTTPIntegrationEventItem extends Component<Props> {
    render() {
        const {name, value, children} = this.props

        if ((!value && !children) || value === null) {
            return (
                <div className="mt-1">
                    <b className="mr-1">{name}:</b>
                    <span>empty</span>
                </div>
            )
        }

        return (
            <div className="mt-1">
                <b className="mr-1">{name}:</b>
                {children ? children : <span>{value}</span>}
            </div>
        )
    }
}
