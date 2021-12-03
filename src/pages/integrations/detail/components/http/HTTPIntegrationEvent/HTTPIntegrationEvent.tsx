import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Badge, Col, Container, Row} from 'reactstrap'

import {DatetimeLabel} from '../../../../../common/utils/labels'
import HTTPStatusLabel from '../../../../../common/components/HTTPStatusLabel/HTTPStatusLabel'
import InputField from '../../../../../common/forms/InputField.js'
import Loader from '../../../../../common/components/Loader/Loader'
import {countLines} from '../../../../../../utils/string'
import {fetchHTTPIntegrationEvent} from '../../../../../../state/HTTPIntegrationEvents/actions'
import {getHTTPIntegrationEvent} from '../../../../../../state/HTTPIntegrationEvents/selectors'
import {RootState} from '../../../../../../state/types'
import settingsCss from '../../../../../settings/settings.less'

import HTTPParams from './HTTPIntegrationEventParams/HTTPIntegrationEventParams'
import HTTPItem from './HTTPIntegrationEventItem/HTTPIntegrationEventItem'
import css from './HTTPIntegrationEvent.less'

type Props = {
    eventId: number
    integrationId: number
} & ConnectedProps<typeof connector>

type State = {
    isFetching?: boolean
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
    state: State = {}

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

        const request: Map<any, any> = event.get('request')
        const response: Map<any, any> = event.get('response')
        let responseError: string | undefined = response.get('error')

        if (!request) {
            return (
                <Container fluid className={css.pageContainer}>
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
        const requestMethod: string = request.get('method')
        let responseBody = response.get('body') || null
        let requestJSONBody = null
        let requestFormBody = null
        let requestJSONParams = null
        let requestFormParams = null

        try {
            requestJSONBody = JSON.stringify(
                JSON.parse(requestBody),
                undefined,
                4
            )
        } catch (err) {
            requestFormBody = requestBody
        }

        try {
            if (requestParams) {
                requestJSONParams = JSON.stringify(
                    JSON.parse(requestParams),
                    undefined,
                    4
                )
            }
        } catch (err) {
            requestFormParams = requestParams
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
            <Container fluid className={settingsCss.pageContainer}>
                <Row>
                    <Col md="12" lg="6" className={`${css.request} mb-4`}>
                        <Container fluid>
                            <h2 className="mb-4">Request</h2>
                            <HTTPItem name="Method" value={requestMethod} />
                            <HTTPItem name="URL" value={request.get('url')} />
                            <HTTPItem name="Sent">
                                <DatetimeLabel
                                    dateTime={event.get('created_datetime')}
                                />
                            </HTTPItem>
                            <HTTPItem name="Headers" value={requestHeaders}>
                                <HTTPParams params={requestHeaders} />
                            </HTTPItem>
                            <HTTPItem
                                name="Params"
                                value={requestFormParams || requestJSONParams}
                            >
                                {requestFormParams ? (
                                    <HTTPParams params={requestFormParams} />
                                ) : null}
                                {requestJSONParams ? (
                                    <>
                                        {requestMethod.toLowerCase() ===
                                        'get' ? (
                                            <Badge color="warning">
                                                JSON Params are not compatible
                                                with the GET HTTP Method.
                                            </Badge>
                                        ) : null}
                                        <InputField
                                            type="textarea"
                                            value={requestJSONParams}
                                            rows={countLines(requestJSONParams)}
                                            style={{maxHeight: '200px'}}
                                            readOnly
                                        />
                                    </>
                                ) : null}
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

const connector = connect(
    (state: RootState) => ({
        event: getHTTPIntegrationEvent(state),
    }),
    {fetchHTTPIntegrationEvent}
)

export default connector(HTTPIntegrationEventContainer)
