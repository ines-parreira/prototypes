import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import TicketDetailsStat from '../TicketDetailsStat'
import {
    TicketChannel,
    TicketMessageSourceType,
} from '../../../../../../../business/types/ticket'
import {RootState, StoreDispatch} from '../../../../../../../state/types'
import {integrationsState} from '../../../../../../../fixtures/integrations'
import {logEvent} from '../../../../../../../store/middlewares/segmentTracker.js'
import ViewLink from '../../../../ViewLink'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const logEventMock = logEvent as jest.Mock

jest.mock('../../../../../../../store/middlewares/segmentTracker')
jest.mock(
    '../../../../ViewLink',
    () => ({
        filters,
        viewName,
        children,
        ...linkProps
    }: ComponentProps<typeof ViewLink>) => (
        <a data-testid="view-link" {...linkProps}>
            <span aria-label="view name">{viewName}</span>
            <span aria-label="filters">{JSON.stringify(filters, null, 2)}</span>
            <span aria-label="children">{children}</span>
        </a>
    )
)

describe('TicketDetailsStat', () => {
    const defaultState: Partial<RootState> = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
                channels: [TicketChannel.Email],
                agents: [1, 2],
            },
        }),
        integrations: fromJS(integrationsState),
    }

    const minProps: ComponentProps<typeof TicketDetailsStat> = {
        agentId: 1,
        agentName: 'John Doe',
        openTickets: 0,
        channelsBreakdown: Object.values(TicketMessageSourceType).reduce(
            (acc, sourceType: TicketMessageSourceType) => {
                acc[sourceType] = 0
                return acc
            },
            {} as Record<TicketMessageSourceType, number>
        ),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render a message when no assigned tickets', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketDetailsStat {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render open tickets and channels breakdown', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketDetailsStat
                    {...minProps}
                    openTickets={21}
                    channelsBreakdown={{
                        ...minProps.channelsBreakdown,
                        [TicketMessageSourceType.Chat]: 2,
                        [TicketMessageSourceType.Email]: 19,
                    }}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should log event on open tickets click', () => {
        const {getByTestId} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketDetailsStat
                    {...minProps}
                    openTickets={21}
                    channelsBreakdown={{
                        ...minProps.channelsBreakdown,
                        [TicketMessageSourceType.Chat]: 2,
                        [TicketMessageSourceType.Email]: 19,
                    }}
                />
            </Provider>
        )

        fireEvent.click(getByTestId('view-link'))

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})
