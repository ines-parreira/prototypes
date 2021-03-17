import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {HTTPIntegrationEventsContainer} from '../HTTPIntegrationEvents'
import {getMomentNow} from '../../../../../../../utils/date.ts'

const events = fromJS([
    {
        created_datetime: getMomentNow(),
        request: {
            method: 'GET',
            url: 'https://api.gorgias.io',
            status: 200,
            headers: {headersKey1: 'headersValue1'},
            params: {paramKey1: 'paramValue1'},
            body: {bodyKey1: 'bodyValue1'},
        },
    },
])

describe('<HTTPIntegrationEvents />', () => {
    describe('component', () => {
        it('should fetch events when the component will mount', (done) => {
            const fetchEvents = jest.fn(() => Promise.resolve())
            const integrationId = 1
            const component = shallow(
                <HTTPIntegrationEventsContainer
                    integrationId={integrationId}
                    fetchEvents={fetchEvents}
                />
            )
            jest.clearAllMocks()
            component.instance().componentWillMount()

            setTimeout(() => {
                expect(fetchEvents).toHaveBeenCalledWith(integrationId)
                expect(fetchEvents).toHaveBeenCalledTimes(1)
                component.update()
                expect(component.state()).toEqual({isFetching: false})
                done()
            }, 1)
        })

        it('should render a loader while the component is fetching events', () => {
            const component = shallow(
                <HTTPIntegrationEventsContainer
                    integationId="1"
                    events={events}
                />
            )
            component.setState({isFetching: true})

            expect(component).toMatchSnapshot()
        })

        it('should render a loader because the component has no events', () => {
            const component = shallow(
                <HTTPIntegrationEventsContainer integationId="1" />
            )
            component.setState({isFetching: false})

            expect(component).toMatchSnapshot()
        })

        it('should render events', () => {
            const component = shallow(
                <HTTPIntegrationEventsContainer
                    integationId="1"
                    events={events}
                />
            )
            expect(component).toMatchSnapshot()
        })
    })
})
