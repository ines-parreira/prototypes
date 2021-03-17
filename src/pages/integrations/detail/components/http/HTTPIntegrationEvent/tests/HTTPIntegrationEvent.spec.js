import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {HTTPIntegrationEventContainer} from '../HTTPIntegrationEvent'
import {getMomentNow} from '../../../../../../../utils/date.ts'

const HTTPEventWithHTMLResp = fromJS({
    created_datetime: getMomentNow(),
    status: 200,
    request: {
        method: 'GET',
        url: 'https://api.gorgias.io',
        status: 200,
        headers: {headersKey1: 'headersValue1'},
        params: {paramKey1: 'paramValue1'},
        body: {bodyKey1: 'bodyValue1'},
    },
    response: {
        headers: {headersKey1: 'headersValue1'},
        body: '<html><body>Hello world!</body></html>',
    },
})

const HTTPEventWithJSONResp = fromJS({
    created_datetime: getMomentNow(),
    status: 200,
    request: {
        method: 'GET',
        url: 'https://api.gorgias.io',
        status: 200,
        headers: {headersKey1: 'headersValue1'},
        params: {paramKey1: 'paramValue1'},
        body: JSON.stringify({bodyKey1: 'bodyValue1'}),
    },
    response: {
        headers: {headersKey1: 'headersValue1'},
        body: JSON.stringify({bodyKey1: 'bodyValue1'}),
    },
})

const HTTPEventWithEmptyBodies = fromJS({
    created_datetime: getMomentNow(),
    status: 200,
    request: {
        method: 'GET',
        url: 'https://api.gorgias.io',
        status: 200,
        headers: {headersKey1: 'headersValue1'},
    },
    response: {
        headers: {headersKey1: 'headersValue1'},
    },
})

const HTTPEventWithErrorInResponse = fromJS({
    created_datetime: getMomentNow(),
    status: null,
    request: {
        method: 'GET',
        url: 'https://api.gorgias.io',
        status: null,
        headers: {headersKey1: 'headersValue1'},
    },
    response: {
        headers: {headersKey1: 'headersValue1'},
        error: 'There is an error',
    },
})

const httpEventWithoutRequest = fromJS({
    created_datetime: getMomentNow(),
    status: null,
    request: null,
    response: {
        error: 'Only HTTPS scheme is allowed',
    },
})

describe('<HTTPIntegrationEvent />', () => {
    describe('component', () => {
        it('should fetch an event when the component will mount', (done) => {
            const fetchHTTPIntegrationEventContainer = jest.fn(() =>
                Promise.resolve()
            )
            const integrationId = 1
            const eventId = 2
            const component = shallow(
                <HTTPIntegrationEventContainer
                    integrationId={integrationId}
                    eventId={eventId}
                    fetchHTTPIntegrationEvent={
                        fetchHTTPIntegrationEventContainer
                    }
                />
            )
            jest.clearAllMocks()
            component.instance().componentWillMount()

            setTimeout(() => {
                expect(fetchHTTPIntegrationEventContainer).toHaveBeenCalledWith(
                    integrationId,
                    eventId
                )
                expect(
                    fetchHTTPIntegrationEventContainer
                ).toHaveBeenCalledTimes(1)
                component.update()
                expect(component.state()).toEqual({isFetching: false})
                done()
            }, 1)
        })

        it('should render a loader while the component is fetching an event', () => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    eventId="2"
                    integationId="1"
                    event={HTTPEventWithHTMLResp}
                />
            )
            component.setState({isFetching: true})

            expect(component).toMatchSnapshot()
        })

        it('should render a loader because the component has no event', () => {
            const component = shallow(
                <HTTPIntegrationEventContainer eventId="2" integationId="1" />
            )
            component.setState({isFetching: false})

            expect(component).toMatchSnapshot()
        })

        it('should render a loader because the component has an empty event', () => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    eventId="2"
                    integationId="1"
                    event={fromJS({})}
                />
            )
            component.setState({isFetching: false})

            expect(component).toMatchSnapshot()
        })

        it('should render the data of a HTTP request (html response)', () => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    eventId="2"
                    integationId="1"
                    event={HTTPEventWithHTMLResp}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render the data of HTTP request (JSON bodies)', () => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    eventId="2"
                    integationId="1"
                    event={HTTPEventWithJSONResp}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render the data of HTTP request (Empty bodies)', () => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    eventId="2"
                    integationId="1"
                    event={HTTPEventWithEmptyBodies}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it('should render the data of the HTTP request when there was an error making the request', () => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    eventId="2"
                    integationId="1"
                    event={HTTPEventWithErrorInResponse}
                />
            )
            expect(component).toMatchSnapshot()
        })

        it(
            'should render the data of the HTTP request when there was an error making the request and the default ' +
                'message is already in the event',
            () => {
                const error =
                    'There was an error while making this request. Foo bar. There is an error.'

                const component = shallow(
                    <HTTPIntegrationEventContainer
                        eventId="2"
                        integationId="1"
                        event={HTTPEventWithErrorInResponse.setIn(
                            ['response', 'error'],
                            error
                        )}
                    />
                )
                expect(component).toMatchSnapshot()
            }
        )

        it('should render the error that occurred before we could send the request', () => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    eventId="2"
                    integationId="1"
                    event={httpEventWithoutRequest}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
