// @flow
import React, {Component} from 'react'
import HTTPStatus from 'httpstatus'
import {Badge} from 'reactstrap'

type Props = {
    statusCode: number
}


export default class HTTPStatusLabel extends Component<Props> {
    _getHTTPStatusColor = (status: HTTPStatus) => {
        switch (true) {
            case status.isSuccess:
                return 'success'
            case status.isRedirection:
                return 'primary'
            case status.isClientError || status.isServerError:
                return 'danger'
            default:
                return 'secondary'
        }
    }

    render() {
        const {statusCode} = this.props
        const status = new HTTPStatus(statusCode)
        const desc = status.description ? status.description.toUpperCase() : 'UNKNOWN HTTP STATUS CODE'
        const color = this._getHTTPStatusColor(status)

        return (
            <Badge color={color}>
                {status.code} {desc}
            </Badge>
        )
    }
}
