import React from 'react'

import { screen } from '@testing-library/react'
import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { RootState } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import ActionEventsHeader from '../ActionEventsHeader'

const mockStore = configureMockStore([thunk])
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
describe('<ActionEventsHeader />', () => {
    it('should render component', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const storeState = {
            stats: {
                filters: {
                    period: {
                        end_datetime: periodEnd.toISOString(),
                        start_datetime: periodStart.toISOString(),
                    },
                },
            },
        } as RootState

        renderWithRouter(
            <Provider store={mockStore(storeState)}>
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={jest.fn()}
                />
            </Provider>,
        )

        expect(
            screen.getByText(
                'View all events when this Action has been performed',
                { exact: false },
            ),
        ).toBeInTheDocument()
    })

    it('should not show "Partial Success" if isActionEventLogsWIthPartialSuccess is false', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ActionEventLogsWIthPartialSuccess]: false,
        })
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const storeState = {
            stats: {
                filters: {
                    period: {
                        end_datetime: periodEnd.toISOString(),
                        start_datetime: periodStart.toISOString(),
                    },
                },
            },
        } as RootState

        renderWithRouter(
            <Provider store={mockStore(storeState)}>
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={jest.fn()}
                />
            </Provider>,
        )

        expect(screen.queryByText('Success, Partial Success, Error')).toBeNull()
        expect(screen.getByText('Success, Error')).toBeInTheDocument()
    })

    it('should show "Partial Success" if isActionEventLogsWIthPartialSuccess is true', () => {
        const periodStart = moment()
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ActionEventLogsWIthPartialSuccess]: true,
        })
        const periodEnd = periodStart.add(7, 'days')
        const storeState = {
            stats: {
                filters: {
                    period: {
                        end_datetime: periodEnd.toISOString(),
                        start_datetime: periodStart.toISOString(),
                    },
                },
            },
        } as RootState

        renderWithRouter(
            <Provider store={mockStore(storeState)}>
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={jest.fn()}
                />
            </Provider>,
        )

        expect(screen.queryByText('Success, Error')).toBeNull()
        expect(
            screen.getByText('Success, Error, Partial Success'),
        ).toBeInTheDocument()
    })
})
