import HTTPStatus from 'httpstatus'

import type { LegacyColorType as ColorType } from '@gorgias/axiom'
import { LegacyBadge as Badge } from '@gorgias/axiom'

type Props = {
    hasNoRequest?: boolean
    statusCode?: number
}

const getHTTPStatusColor = (status: HTTPStatus) => {
    switch (true) {
        case status.isClientError || status.isServerError:
            return 'error'
        case status.isSuccess:
            return 'success'
        case status.isRedirection:
            return 'classic'
        default:
            return 'grey'
    }
}

export default function HTTPStatusLabel({
    statusCode,
    hasNoRequest = false,
}: Props) {
    let desc = ''
    let color: ColorType = 'grey'
    if (hasNoRequest) {
        desc = 'FAILED TO BUILD REQUEST'
        color = 'error'
    } else if (!statusCode) {
        desc = 'HTTP REQUEST FAILED'
        color = 'error'
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
