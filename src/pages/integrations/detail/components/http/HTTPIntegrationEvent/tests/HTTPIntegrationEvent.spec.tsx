import React, {ComponentProps} from 'react'
import {fromJS, Map} from 'immutable'
import {shallow} from 'enzyme'

import {getMomentNow} from 'utils/date'

import {HTTPIntegrationEventContainer} from '../HTTPIntegrationEvent'

const HTTPEventWithHTMLResp: Map<any, any> = fromJS({
    created_datetime: getMomentNow(),
    status: 200,
    request: {
        method: 'GET',
        url: 'https://developers.gorgias.com',
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

const HTTPEventWithJSONResp: Map<any, any> = fromJS({
    created_datetime: getMomentNow(),
    status: 200,
    request: {
        method: 'GET',
        url: 'https://developers.gorgias.com',
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

const HTTPEventWithEmptyBodies: Map<any, any> = fromJS({
    created_datetime: getMomentNow(),
    status: 200,
    request: {
        method: 'GET',
        url: 'https://developers.gorgias.com',
        status: 200,
        headers: {headersKey1: 'headersValue1'},
    },
    response: {
        headers: {headersKey1: 'headersValue1'},
    },
})

const HTTPEventWithErrorInResponse: Map<any, any> = fromJS({
    created_datetime: getMomentNow(),
    status: null,
    request: {
        method: 'GET',
        url: 'https://developers.gorgias.com',
        status: null,
        headers: {headersKey1: 'headersValue1'},
    },
    response: {
        headers: {headersKey1: 'headersValue1'},
        error: 'There is an error',
    },
})

const httpEventWithoutRequest: Map<any, any> = fromJS({
    created_datetime: getMomentNow(),
    status: null,
    request: null,
    response: {
        error: 'Only HTTPS scheme is allowed',
    },
})

const HTTPEventWithJSONParamsAndGETMethod: Map<string, any> = fromJS({
    created_datetime: getMomentNow(),
    status: 200,
    request: {
        method: 'GET',
        url: 'https://developers.gorgias.com',
        status: 200,
        headers: {headersKey1: 'headersValue1'},
        params: `"{\"paramKey1\": \"paramValue1\"}"`,
        body: JSON.stringify({bodyKey1: 'bodyValue1'}),
    },
    response: {
        headers: {headersKey1: 'headersValue1'},
        body: JSON.stringify({bodyKey1: 'bodyValue1'}),
    },
})

const minProps: ComponentProps<typeof HTTPIntegrationEventContainer> = {
    eventId: 1,
    integrationId: 1,
    event: fromJS({}),
    fetchHTTPIntegrationEvent: jest.fn(() => Promise.resolve()),
}

describe('<HTTPIntegrationEvent />', () => {
    describe('component', () => {
        it('should fetch an event when the component will mount', (done) => {
            const fetchHTTPIntegrationEventContainer = jest.fn(() =>
                Promise.resolve()
            )
            const integrationId = 1
            const eventId = 2
            const component = shallow<HTTPIntegrationEventContainer>(
                <HTTPIntegrationEventContainer
                    {...minProps}
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
                    {...minProps}
                    eventId={2}
                    event={HTTPEventWithHTMLResp}
                />
            )
            component.setState({isFetching: true})

            expect(component).toMatchSnapshot()
        })

        it('should render a loader because the component has no event', () => {
            const component = shallow(
                <HTTPIntegrationEventContainer {...minProps} eventId={2} />
            )
            component.setState({isFetching: false})

            expect(component).toMatchSnapshot()
        })

        it('should render a loader because the component has an empty event', () => {
            const component = shallow(
                <HTTPIntegrationEventContainer {...minProps} eventId={2} />
            )
            component.setState({isFetching: false})

            expect(component).toMatchSnapshot()
        })

        it('should render the data of a HTTP request (html response)', (done) => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    {...minProps}
                    eventId={2}
                    event={HTTPEventWithHTMLResp}
                />
            )
            setImmediate(() => {
                expect(component).toMatchSnapshot()
                done()
            })
        })

        it('should render the data of HTTP request (JSON bodies)', (done) => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    {...minProps}
                    eventId={2}
                    event={HTTPEventWithJSONResp}
                />
            )
            setImmediate(() => {
                expect(component).toMatchSnapshot()
                done()
            })
        })

        it('should render the data of HTTP request (Empty bodies)', (done) => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    {...minProps}
                    eventId={2}
                    event={HTTPEventWithEmptyBodies}
                />
            )
            setImmediate(() => {
                expect(component).toMatchSnapshot()
                done()
            })
        })

        it('should render the data of the HTTP request when there was an error making the request', (done) => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    {...minProps}
                    eventId={2}
                    event={HTTPEventWithErrorInResponse}
                />
            )
            setImmediate(() => {
                expect(component).toMatchSnapshot()
                done()
            })
        })

        it('should render the data of the HTTP request with GET method and JSON Params, with a warning', (done) => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    {...minProps}
                    eventId={2}
                    event={HTTPEventWithJSONParamsAndGETMethod}
                />
            )
            setImmediate(() => {
                expect(component).toMatchSnapshot()
                done()
            })
        })

        it(
            'should render the data of the HTTP request when there was an error making the request and the default ' +
                'message is already in the event',
            (done) => {
                const error =
                    'There was an error while making this request. Foo bar. There is an error.'

                const component = shallow(
                    <HTTPIntegrationEventContainer
                        {...minProps}
                        eventId={2}
                        event={HTTPEventWithErrorInResponse.setIn(
                            ['response', 'error'],
                            error
                        )}
                    />
                )
                setImmediate(() => {
                    expect(component).toMatchSnapshot()
                    done()
                })
            }
        )

        it('should render the error that occurred before we could send the request', (done) => {
            const component = shallow(
                <HTTPIntegrationEventContainer
                    {...minProps}
                    eventId={2}
                    event={httpEventWithoutRequest}
                />
            )

            setImmediate(() => {
                expect(component).toMatchSnapshot()
                done()
            })
        })
    })
})
