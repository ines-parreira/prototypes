import HTTPStatus from 'httpstatus'
import React from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

type Props = {
    hasNoRequest?: boolean
    statusCode?: number
}

const getHTTPStatusColor = (status: HTTPStatus) => {
    switch (true) {
        case status.isClientError || status.isServerError:
            return ColorType.Error
        case status.isSuccess:
            return ColorType.Success
        case status.isRedirection:
            return ColorType.Classic
        default:
            return ColorType.Grey
    }
}

export default function HTTPStatusLabel({
    statusCode,
    hasNoRequest = false,
}: Props) {
    let desc, color
    if (hasNoRequest) {
        desc = 'FAILED TO BUILD REQUEST'
        color = ColorType.Error
    } else if (!statusCode) {
        desc = 'HTTP REQUEST FAILED'
        color = ColorType.Error
    } else {
        const status = new HTTPStatus(statusCode)
        desc =
            status.code +
            ' ' +
            (status.description
                ? status.description.toUpperCase()
                : 'UNKNOWN HTTP STATUS CODE') // it should not happen, please a case if it does

        color = getHTTPStatusColor(status)
    }
    // if request or status code is empty, then the request failed

    return <Badge type={color}>{desc}</Badge>
}
