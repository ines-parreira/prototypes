import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import {Container, Table} from 'reactstrap'
import _truncate from 'lodash/truncate'
import {Map} from 'immutable'
import {useAsyncFn} from 'react-use'

import {HTTP_METHOD_GET} from 'config'
import {fetchHTTPIntegrationEvents} from 'state/HTTPIntegrationEvents/actions'
import {getHTTPIntegrationEvents} from 'state/HTTPIntegrationEvents/selectors'
import {RootState} from 'state/types'
import Loader from 'pages/common/components/Loader/Loader'
import {DatetimeLabel} from 'pages/common/utils/labels'
import HTTPStatusLabel from 'pages/common/components/HTTPStatusLabel/HTTPStatusLabel'
import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'
import css from 'pages/settings/settings.less'

import {BASE_PATH, EVENTS_PATH} from '../constants'

function Event({
    event,
    integrationId,
}: {
    event: Map<any, any>
    integrationId: string
}) {
    const editLink = `${BASE_PATH}/${integrationId}/${EVENTS_PATH}/${
        event.get('id') as string
    }`

    return (
        <tr>
            <td className="link-full-td">
                <Link to={editLink} className="disabled">
                    <div>
                        {event.getIn(['request', 'method'], HTTP_METHOD_GET)}
                    </div>
                </Link>
            </td>
            <td className="link-full-td">
                <Link to={editLink} className="disabled">
                    <div>
                        {_truncate(event.getIn(['request', 'url']), {
                            length: 100,
                        })}
                    </div>
                </Link>
            </td>
            <td className="link-full-td">
                <Link to={editLink} className="disabled">
                    <div>
                        <HTTPStatusLabel
                            statusCode={event.get('status_code')}
                        />
                    </div>
                </Link>
            </td>
            <td className="link-full-td">
                <Link to={editLink} className="disabled">
                    <div>
                        <DatetimeLabel
                            dateTime={event.get('created_datetime')}
                        />
                    </div>
                </Link>
            </td>
            <td className="smallest align-middle">
                <ForwardIcon href={editLink} />
            </td>
        </tr>
    )
}

type Props = {
    integrationId: string
} & ConnectedProps<typeof connector>

export function Events({events, integrationId, fetchEvents}: Props) {
    const [{loading: isFetching}, handleFetchEvents] = useAsyncFn(
        async (integrationId: string) => {
            if (!integrationId) {
                return
            }

            await fetchEvents(parseInt(integrationId))
        },
        [],
        {loading: true}
    )

    useEffect(() => {
        void handleFetchEvents(integrationId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!events || isFetching) {
        return <Loader />
    }

    return (
        <div>
            <Container fluid className={css.pageContainer}>
                <p>
                    Shows the latest HTTP requests sent by this integration with
                    their responses. This page is useful to see if this
                    integration works correctly.
                </p>
                {events.isEmpty() ? (
                    <p>
                        <b>
                            There is no logs because this integration has not
                            been run yet.
                        </b>
                    </p>
                ) : null}
            </Container>
            <br />
            {events.isEmpty() ? null : (
                <Table hover className="view-table table-integrations">
                    <thead>
                        <tr>
                            <th>Method</th>
                            <th>URL</th>
                            <th>Status code</th>
                            <th>Sent</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event: Map<any, any>) => (
                            <Event
                                key={event.get('id')}
                                event={event}
                                integrationId={integrationId}
                            />
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    )
}

const connector = connect(
    (state: RootState) => {
        return {
            events: getHTTPIntegrationEvents(state),
        }
    },
    {
        fetchEvents: fetchHTTPIntegrationEvents,
    }
)

export default connector(Events)
