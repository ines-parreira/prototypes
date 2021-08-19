// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {Container, Table} from 'reactstrap'
import _truncate from 'lodash/truncate'

import {HTTP_METHOD_GET} from '../../../../../../config.ts'

import Loader from '../../../../../common/components/Loader/Loader.tsx'
import ForwardIcon from '../../ForwardIcon.tsx'
import {DatetimeLabel} from '../../../../../common/utils/labels.tsx'
import HTTPStatusLabel from '../../../../../common/components/HTTPStatusLabel'

import {fetchHTTPIntegrationEvents} from '../../../../../../state/HTTPIntegrationEvents/actions.ts'
import {getHTTPIntegrationEvents} from '../../../../../../state/HTTPIntegrationEvents/selectors.ts'

type Props = {
    events?: Object,
    fetchEvents: (number) => Promise<*>,
    integrationId: number,
}

type State = {
    isFetching: boolean,
}

export class HTTPIntegrationEventsContainer extends Component<Props, State> {
    state = {
        isFetching: false,
    }

    componentWillMount() {
        this._fetchEvents(this.props.integrationId)
    }

    _fetchEvents = (integrationId: number) => {
        if (!integrationId) {
            return
        }

        const {fetchEvents} = this.props
        this.setState({isFetching: true})

        fetchEvents(integrationId)
            .then(() => {
                this.setState({isFetching: false})
            })
            .catch(() => {
                this.setState({isFetching: false})
            })
    }

    _renderEvent = (event: Object) => {
        const {integrationId} = this.props
        const editLink = `/app/settings/integrations/http/${integrationId}/events/${event.get(
            'id'
        )}`

        return (
            <tr key={event.get('id')}>
                <td className="link-full-td">
                    <Link to={editLink} className="disabled">
                        <div>
                            {event.getIn(
                                ['request', 'method'],
                                HTTP_METHOD_GET
                            )}
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

    render() {
        const {events} = this.props
        const {isFetching} = this.state

        if (!events || isFetching) {
            return <Loader />
        }

        return (
            <div>
                <Container fluid className="page-container">
                    <p>
                        Shows the latest HTTP requests sent by this integration
                        with their responses. This page is useful to see if this
                        integration works correctly.
                    </p>
                    {events.isEmpty() ? (
                        <p>
                            <b>
                                There is no logs because this integration has
                                not been run yet.
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
                        <tbody>{events.map(this._renderEvent)}</tbody>
                    </Table>
                )}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        events: getHTTPIntegrationEvents(state),
    }
}
export default connect(mapStateToProps, {
    fetchEvents: fetchHTTPIntegrationEvents,
})(HTTPIntegrationEventsContainer)
