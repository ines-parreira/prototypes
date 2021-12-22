import React, {Component} from 'react'
import {Map} from 'immutable'

type Props = {
    params?: Map<any, any>
}

export default class HTTPIntegrationEventParams extends Component<Props> {
    render() {
        const {params} = this.props

        if (!params) {
            return null
        }

        return (
            <ul>
                {params
                    .map((value, key) => (
                        <li key={key}>
                            <b className="mr-1">{key}:</b>
                            <span>{value}</span>
                        </li>
                    ))
                    .valueSeq()
                    .toJS()}
            </ul>
        )
    }
}
