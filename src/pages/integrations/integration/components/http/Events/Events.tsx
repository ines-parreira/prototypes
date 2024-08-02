import React from 'react'
import {Link} from 'react-router-dom'
import _truncate from 'lodash/truncate'
import classnames from 'classnames'

import {HTTP_METHOD_GET} from 'config'
import {HTTPIntegrationEvent} from 'models/integration/types'
import {useGetHTTPEvents} from 'models/integration/queries/http'
import Loader from 'pages/common/components/Loader/Loader'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import HTTPStatusLabel from 'pages/common/components/HTTPStatusLabel/HTTPStatusLabel'
import {BASE_PATH, EVENTS_PATH} from '../constants'
import css from './Events.less'

function Event({
    event,
    integrationId,
}: {
    event: HTTPIntegrationEvent
    integrationId: string
}) {
    const editLink = `${BASE_PATH}/${integrationId}/${EVENTS_PATH}/${event.id}`

    return (
        <li>
            <Link
                to={editLink}
                className={classnames(css.inlineGrid, css.link)}
            >
                <span>{event.request?.method || HTTP_METHOD_GET}</span>
                <span>{_truncate(event.request?.url, {length: 100})}</span>
                <span>
                    <HTTPStatusLabel
                        hasNoRequest={!event.request}
                        statusCode={event.status_code}
                    />
                </span>
                <span>
                    <DatetimeLabel dateTime={event.created_datetime} />
                </span>
                <span>
                    <i className="material-icons md-2 align-middle icon-go-forward">
                        keyboard_arrow_right
                    </i>
                </span>
            </Link>
        </li>
    )
}

type Props = {
    integrationId: string
}

export function Events({integrationId}: Props) {
    const {
        data: events,
        isLoading,
        isError,
    } = useGetHTTPEvents(Number.parseInt(integrationId, 10), {
        select: (data) => data.data.data,
        refetchOnWindowFocus: true,
    })

    if (isLoading) {
        return <Loader data-testid="loader" />
    }

    if (isError || !events) {
        return (
            <div className={css.wrapper}>
                <h2 className="mb-4">
                    An error occurred while fetching the events
                </h2>
            </div>
        )
    }

    return (
        <>
            <div className={css.wrapper}>
                <p>
                    Shows the latest HTTP requests sent by this integration with
                    their responses. This page is useful to see if this
                    integration works correctly.
                </p>
                {!events.length && (
                    <p>
                        <b>
                            There is no logs because this integration has not
                            been run yet.
                        </b>
                    </p>
                )}
            </div>
            {events.length > 0 && (
                <ul className={css.list}>
                    <li
                        className={classnames(css.inlineGrid, css.columnTitles)}
                    >
                        <span>Method</span>
                        <span>URL</span>
                        <span>Status code</span>
                        <span>Sent</span>
                    </li>
                    {events.map((event) => (
                        <Event
                            key={event.id}
                            event={event}
                            integrationId={integrationId}
                        />
                    ))}
                </ul>
            )}
        </>
    )
}

export default Events
