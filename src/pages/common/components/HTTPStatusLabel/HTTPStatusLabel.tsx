import React from 'react'
import HTTPStatus from 'httpstatus'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

type Props = {
    statusCode: number
}

const getHTTPStatusColor = (status: HTTPStatus) => {
    switch (true) {
        case status.isSuccess:
            return ColorType.Success
        case status.isRedirection:
            return ColorType.Classic
        case status.isClientError || status.isServerError:
            return ColorType.Error
        default:
            return ColorType.Grey
    }
}

export default function HTTPStatusLabel({statusCode}: Props) {
    const status = new HTTPStatus(statusCode)
    const desc = status.description
        ? status.description.toUpperCase()
        : 'UNKNOWN HTTP STATUS CODE'
    const color = getHTTPStatusColor(status)

    return (
        <Badge type={color}>
            {status.code} {desc}
        </Badge>
    )
}
