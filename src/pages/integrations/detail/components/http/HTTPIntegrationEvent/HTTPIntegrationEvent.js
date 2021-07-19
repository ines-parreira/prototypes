// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Col, Container, Row} from 'reactstrap'

import {DatetimeLabel} from '../../../../../common/utils/labels.tsx'
import HTTPStatusLabel from '../../../../../common/components/HTTPStatusLabel'
import InputField from '../../../../../common/forms/InputField'
import Loader from '../../../../../common/components/Loader/Loader.tsx'

import {countLines} from '../../../../../../utils/string.ts'
import {fetchHTTPIntegrationEvent} from '../../../../../../state/HTTPIntegrationEvents/actions.ts'
import {getHTTPIntegrationEvent} from '../../../../../../state/HTTPIntegrationEvents/selectors.ts'

import HTTPParams from './HTTPIntegrationEventParams'
import HTTPItem from './HTTPIntegrationEventItem'

import css from './HTTPIntegrationEvent.less'

type Props = {
    eventId: number,
    event?: Object,
    fetchHTTPIntegrationEvent: (number, number) => Promise<*>,
    integrationId: number,
}

type State = {
    isFetching?: boolean,
}

const DEFAULT_ERROR_MESSAGE =
    'There was an error while making this request. This can happen for multiple reasons:\n' +
    '- there is a typo in the request URL\n' +
    "- the server you're trying to reach is not running right now\n" +
    "- the server you're trying to reach is not returning a response fast enough (timeout)\n" +
    '- the DNS records for this URL are not propagated yet\n' +
    '- ...\n\n' +
    "Please double check that the request you're trying to make should work, using tools like cURL or " +
    'Postman for example, and if it is the case please reach out to us at "support@gorgias.com". Details:\n\n'

export class HTTPIntegrationEventContainer extends Component<Props, State> {
    state = {}

    _fetchEvent = (integrationId: number, eventId: number) => {
        if (!integrationId || !eventId) {
            return
        }

        this.setState({isFetching: true})

        this.props
            .fetchHTTPIntegrationEvent(integrationId, eventId)
            .then(() => {
                this.setState({isFetching: false})
            })
            .catch(() => {
                this.setState({isFetching: false})
            })
    }

    componentWillMount() {
        const {integrationId, eventId} = this.props
        this._fetchEvent(integrationId, eventId)
    }

    render() {
        const {event} = this.props
        const {isFetching} = this.state

        if (!event || event.isEmpty() || isFetching) {
            return <Loader />
        }

        const request = event.get('request')
        const response = event.get('response')
        let responseError = response.get('error')

        if (!request) {
            return (
                <Container fluid className="page-container">
                    <Row>
                        <Col className="mb-4">
                            <h2 className="mb-4">Error</h2>
                            <p>
                                The following error occurred before we could
                                send the request:
                            </p>
                            <pre>{responseError}</pre>
                        </Col>
                    </Row>
                </Container>
            )
        }

        const requestHeaders = request.get('headers')
        const responseHeaders = response.get('headers')
        const requestParams = request.get('params') || null
        const requestBody = request.get('body')
        let responseBody = response.get('body') || null
        let requestJSONBody = null
        let requestFormBody = null

        try {
            requestJSONBody = JSON.stringify(
                JSON.parse(requestBody),
                undefined,
                4
            )
        } catch (err) {
            requestFormBody = requestBody
        }

        if (responseBody) {
            try {
                responseBody = JSON.stringify(
                    JSON.parse(responseBody),
                    undefined,
                    4
                )
            } catch (err) {
                // ignore parsing error
            }
        }

        if (!!responseError && !event.get('status_code')) {
            // Previously, a similar default message (not exactly the same) was stored in database, along with the error
            if (
                !responseError.startsWith(
                    'There was an error while making this request.'
                )
            ) {
                responseError = DEFAULT_ERROR_MESSAGE + responseError
            }
        }

        return (
            <Container fluid className="page-container">
                <Row>
                    <Col md="12" lg="6" className={`${css.request} mb-4`}>
                        <Container fluid>
                            <h2 className="mb-4">Request</h2>
                            <HTTPItem
                                name="Method"
                                value={request.get('method')}
                            />
                            <HTTPItem name="URL" value={request.get('url')} />
                            <HTTPItem name="Sent">
                                <DatetimeLabel
                                    dateTime={event.get('created_datetime')}
                                />
                            </HTTPItem>
                            <HTTPItem name="Headers" value={requestHeaders}>
                                <HTTPParams params={requestHeaders} />
                            </HTTPItem>
                            <HTTPItem name="Params" value={requestParams}>
                                <HTTPParams params={requestParams} />
                            </HTTPItem>
                            <HTTPItem
                                name="Body"
                                value={requestFormBody || requestJSONBody}
                            >
                                {requestFormBody ? (
                                    <HTTPParams params={requestFormBody} />
                                ) : null}
                                {requestJSONBody ? (
                                    <InputField
                                        type="textarea"
                                        value={requestJSONBody}
                                        rows={countLines(requestJSONBody)}
                                        readOnly
                                    />
                                ) : null}
                            </HTTPItem>
                        </Container>
                    </Col>
                    <Col md="12" lg="6" className={css.response}>
                        <Container fluid>
                            <h2 className="mb-4">Response</h2>
                            <HTTPItem name="Status code">
                                <HTTPStatusLabel
                                    statusCode={event.get('status_code')}
                                />
                            </HTTPItem>
                            <HTTPItem name="Headers">
                                <HTTPParams params={responseHeaders} />
                            </HTTPItem>
                            <HTTPItem name="Body" value={responseBody}>
                                {responseBody ? (
                                    <InputField
                                        type="textarea"
                                        value={responseBody}
                                        rows={countLines(responseBody)}
                                        readOnly
                                    />
                                ) : null}
                            </HTTPItem>
                            {responseError ? (
                                <HTTPItem name="Error">
                                    <pre>{responseError}</pre>
                                </HTTPItem>
                            ) : null}
                        </Container>
                    </Col>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        event: getHTTPIntegrationEvent(state),
    }
}

export default connect(mapStateToProps, {fetchHTTPIntegrationEvent})(
    HTTPIntegrationEventContainer
)
