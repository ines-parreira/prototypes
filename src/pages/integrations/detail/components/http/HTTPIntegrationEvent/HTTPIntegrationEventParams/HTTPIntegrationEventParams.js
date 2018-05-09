// @flow
import React, {Component} from 'react'

type Props = {
    params: Object | null
}

export default class HTTPIntegrationEventParams extends Component<Props> {
    render() {
        const {params} = this.props

        if (!params) {
            return null
        }

        return (
            <ul>
                {params.map((value, key) => (
                    <li key={key}>
                        <b className="mr-1">{key}:</b>
                        <span className="text-black">
                        {value}
                    </span>
                    </li>
                ))}
            </ul>
        )
    }
}
