// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Col, Container, Row} from 'reactstrap'

import {DatetimeLabel} from '../../../../../common/utils/labels'
import HTTPItem from './HTTPIntegrationEventItem'
import HTTPParams from './HTTPIntegrationEventParams'
import HTTPStatusLabel from '../../../../../common/components/HTTPStatusLabel'
import InputField from '../../../../../common/forms/InputField'
import Loader from '../../../../../common/components/Loader/Loader'

import {countLines} from '../../../../../../utils/string'
import {fetchHTTPIntegrationEvent} from '../../../../../../state/HTTPIntegrationEvents/actions'
import {getHTTPIntegrationEvent} from '../../../../../../state/HTTPIntegrationEvents/selectors'

import css from './HTTPIntegrationEvent.less'

type Props = {
    eventId: number,
    event?: Object,
    fetchHTTPIntegrationEvent: (number, number) => Promise<*>,
    integrationId: number,
}

type State = {
    isFetching?: boolean
}

export class HTTPIntegrationEvent extends Component<Props, State> {
    state = {}

    _fetchEvent = (integrationId: number, eventId: number) => {
        if (!integrationId || !eventId) {
            return
        }

        this.setState({isFetching: true})

        this.props.fetchHTTPIntegrationEvent(integrationId, eventId).then(() => {
            this.setState({isFetching: false})
        }).catch(() => {
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
            return <Loader/>
        }

        const request = event.get('request')
        const response = event.get('response')
        const requestHeaders = request.get('headers')
        const responseHeaders = response.get('headers')
        const requestParams = request.get('params') || null
        const requestBody = request.get('body')
        const responseBody = response.get('body') || null
        let requestJSONBody = null
        let requestFormBody = null

        try {
            requestJSONBody = JSON.stringify(JSON.parse(requestBody), undefined, 4)
        } catch (err) {
            requestFormBody = requestBody
        }

        return (
            <Container fluid className="page-container">
                <Row>
                    <Col md="12" lg="6" className={`${css.request} mb-4`}>
                        <Container fluid>
                            <h2 className='mb-4'>Request</h2>
                            <HTTPItem name="Method" value={request.get('method')}/>
                            <HTTPItem name="URL" value={request.get('url')}/>
                            <HTTPItem name="Sent">
                                <DatetimeLabel dateTime={event.get('created_datetime')}/>
                            </HTTPItem>
                            <HTTPItem name="Headers" value={requestHeaders}>
                                <HTTPParams params={requestHeaders}/>
                            </HTTPItem>
                            <HTTPItem name="Params" value={requestParams}>
                                <HTTPParams params={requestParams}/>
                            </HTTPItem>
                            <HTTPItem name="Body" value={requestFormBody || requestJSONBody}>
                                {requestFormBody ? <HTTPParams params={requestFormBody}/> : null}
                                {requestJSONBody ?
                                    <InputField
                                        type="textarea"
                                        value={requestJSONBody}
                                        rows={countLines(requestJSONBody)}
                                        readOnly
                                    />
                                    :
                                    null
                                }
                            </HTTPItem>
                        </Container>
                    </Col>
                    <Col md="12" lg="6" className={css.response}>
                        <Container fluid>
                            <h2 className='mb-4'>Response</h2>
                            <HTTPItem name="Status code">
                                <HTTPStatusLabel statusCode={event.get('status')}/>
                            </HTTPItem>
                            <HTTPItem name="Headers">
                                <HTTPParams params={responseHeaders}/>
                            </HTTPItem>
                            <HTTPItem name="Body" value={responseBody}>
                                {responseBody ?
                                    <InputField
                                        type="textarea"
                                        value={responseBody}
                                        rows={countLines(responseBody)}
                                        readOnly
                                    />
                                    :
                                    null
                                }
                            </HTTPItem>
                        </Container>
                    </Col>
                </Row>
            </Container>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        event: getHTTPIntegrationEvent(state)
    }
}

export default connect(mapStateToProps, {fetchHTTPIntegrationEvent})(HTTPIntegrationEvent)
