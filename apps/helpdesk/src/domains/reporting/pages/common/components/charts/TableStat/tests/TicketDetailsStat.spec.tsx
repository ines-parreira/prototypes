import type { ComponentProps } from 'react'
import React from 'react'

import { logEvent, reportError } from '@repo/logging'
import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import type { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import TicketDetailsStat from 'domains/reporting/pages/common/components/charts/TableStat/TicketDetailsStat'
import type ViewLink from 'domains/reporting/pages/common/ViewLink'
import StatsFiltersContext from 'domains/reporting/pages/StatsFiltersContext'
import { channels } from 'fixtures/channels'
import { integrationsState } from 'fixtures/integrations'
import * as channelsService from 'services/channels'
import type { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const logEventMock = logEvent as jest.Mock
const reportErrorMock = reportError as jest.Mock

jest.mock('@repo/logging')
jest.mock(
    'domains/reporting/pages/common/ViewLink',
    () =>
        ({
            filters,
            viewName,
            children,
            ...linkProps
        }: ComponentProps<typeof ViewLink>) => (
            <a data-testid="view-link" {...linkProps}>
                <span aria-label="view name">{viewName}</span>
                <span aria-label="filters">
                    {JSON.stringify(filters, null, 2)}
                </span>
                <span aria-label="children">{children}</span>
            </a>
        ),
)
jest.spyOn(channelsService, 'getChannels').mockReturnValue(channels)

describe('TicketDetailsStat', () => {
    const defaultStatsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
        channels: [TicketChannel.Email],
        agents: [1, 2],
    }
    const defaultState = {
        integrations: fromJS(integrationsState),
        entities: {
            tags: {},
        },
    } as RootState
    const minProps: ComponentProps<typeof TicketDetailsStat> = {
        agentId: 1,
        agentName: 'John Doe',
        openTickets: 0,
        channelsBreakdown: channelsService.getChannels().reduce(
            (acc, channel) => {
                acc[channel.slug] = 0
                return acc
            },
            {} as Record<string, number>,
        ),
    }

    it('should render a message when no assigned tickets', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketDetailsStat {...minProps} />
                </StatsFiltersContext.Provider>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render open tickets and channels breakdown', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketDetailsStat
                        {...minProps}
                        openTickets={21}
                        channelsBreakdown={{
                            ...minProps.channelsBreakdown,
                            [TicketChannel.Chat]: 2,
                            [TicketChannel.Email]: 19,
                        }}
                    />
                </StatsFiltersContext.Provider>
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should log event on view link click', () => {
        const { getAllByTestId } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketDetailsStat
                        {...minProps}
                        openTickets={21}
                        channelsBreakdown={{
                            ...minProps.channelsBreakdown,
                            [TicketChannel.Chat]: 2,
                            [TicketChannel.Email]: 19,
                        }}
                    />
                </StatsFiltersContext.Provider>
            </Provider>,
        )

        for (const element of getAllByTestId('view-link')) {
            fireEvent.click(element)
        }

        expect(logEventMock.mock.calls).toMatchSnapshot()
    })

    it('should handle an unknown channel and report error', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <StatsFiltersContext.Provider value={defaultStatsFilters}>
                    <TicketDetailsStat
                        {...minProps}
                        openTickets={21}
                        channelsBreakdown={{
                            [TicketChannel.Chat]: 2,
                            foo: 1,
                            bar: 2,
                        }}
                    />
                </StatsFiltersContext.Provider>
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(reportErrorMock.mock.calls).toMatchSnapshot()
    })
})
