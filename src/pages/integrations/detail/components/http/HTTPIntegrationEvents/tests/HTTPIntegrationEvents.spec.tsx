import React from 'react'
import {fromJS} from 'immutable'
import {render, waitForElementToBeRemoved} from '@testing-library/react'

import {HTTPIntegrationEventsContainer} from '../HTTPIntegrationEvents'
import {getMomentNow} from '../../../../../../../utils/date'

const events = fromJS([
    {
        created_datetime: getMomentNow(),
        request: {
            method: 'GET',
            url: 'https://developers.gorgias.com',
            status: 200,
            headers: {headersKey1: 'headersValue1'},
            params: {paramKey1: 'paramValue1'},
            body: {bodyKey1: 'bodyValue1'},
        },
    },
])

jest.mock('../../../../../../common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))

jest.mock('../../../../../../common/utils/labels', () => {
    return {
        DatetimeLabel: ({dateTime}: {dateTime: string}) => (
            <div>{dateTime}</div>
        ),
    }
})

describe('<HTTPIntegrationEvents />', () => {
    describe('component', () => {
        const fetchEvents = jest.fn(() => Promise.resolve())
        const integrationId = '1'
        const commonProps = {
            fetchEvents,
            integrationId,
            events: fromJS([]),
        }
        it('should fetch events when the component mounts', async () => {
            jest.clearAllMocks()
            const {getByText} = render(
                <HTTPIntegrationEventsContainer {...commonProps} />
            )

            await waitForElementToBeRemoved(() => getByText('Loader'))
            expect(fetchEvents).toHaveBeenCalledWith(parseInt(integrationId))
            expect(fetchEvents).toHaveBeenCalledTimes(1)
        })

        it('should render a loader while the component is fetching events', () => {
            const {container} = render(
                <HTTPIntegrationEventsContainer
                    {...commonProps}
                    events={events}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a loader because the component has no events', () => {
            const {container} = render(
                <HTTPIntegrationEventsContainer {...commonProps} />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render events', async () => {
            const {container, getByText} = render(
                <HTTPIntegrationEventsContainer
                    {...commonProps}
                    events={events}
                />
            )

            await waitForElementToBeRemoved(() => getByText('Loader'))
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
