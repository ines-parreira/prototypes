import { matchPath } from 'react-router-dom'

import history from 'pages/history'

export default function goToTicket(ticketId: number | string) {
    const match = matchPath<{ viewId?: string }>(window.location.pathname, {
        path: '/app/views/:viewId',
        exact: false,
        strict: false,
    })

    const viewId = match?.params.viewId

    if (viewId) {
        history.push(`/app/views/${viewId}/${ticketId}`)
    } else {
        history.push(`/app/ticket/${ticketId}`)
    }
}
