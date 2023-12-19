import LD from 'launchdarkly-react-client-sdk'
import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {ReportingGranularity} from 'models/reporting/types'
import {user} from 'fixtures/users'
import {FeatureFlagKey} from 'config/featureFlags'

import {
    DrillDownDownloadButton,
    DOWNLOAD_REQUESTED_LABEL,
    DOWNLOAD_LOADING_LABEL,
    TOTAL_TICKETS_COUNT_PLACEHOLDER,
} from 'pages/stats/DrillDownDownloadButton'
import {RootState} from 'state/types'
import {agents} from 'fixtures/agents'
import {UserRole} from 'config/types/user'
import {
    AgentsMetrics,
    drillDownSlice,
    EXPORT_TICKET_DRILL_DOWN_JOB_ACTION,
    initialState,
} from 'state/ui/stats/drillDownSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {TableColumn} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore([thunk])
const useFlagsMock = jest.spyOn(LD, 'useFlags')

jest.mock('state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)

describe('<DrillDownDownloadButton />', () => {
    const cleanStatsFilters = {
        period: {
            start_datetime: '1970-01-01T00:00:00+00:00',
            end_datetime: '1970-01-01T00:00:00+00:00',
        },
    }
    beforeEach(() => {
        useFlagsMock.mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsDrillDownExport]: true,
        }))

        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            userTimezone: 'someTimezone',
            cleanStatsFilters,
            granularity: ReportingGranularity.Day,
        })
    })
    const metricData: AgentsMetrics = {
        metricName: TableColumn.CustomerSatisfaction,
        perAgentId: 123,
    }

    const defaultState = {
        currentUser: fromJS(user),
        ui: {
            [drillDownSlice.name]: initialState,
        },
    } as unknown as RootState

    it('should render button', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownDownloadButton metricData={metricData} />
            </Provider>
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should not render if the Feature Flag is off', () => {
        useFlagsMock.mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsDrillDownExport]: false,
        }))

        render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownDownloadButton metricData={metricData} />
            </Provider>
        )

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render disabled button', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({
                        ...agents[0],
                        role: {name: UserRole.ObserverAgent},
                    }),
                    ui: {
                        [drillDownSlice.name]: initialState,
                    },
                } as unknown as RootState)}
            >
                <DrillDownDownloadButton metricData={metricData} />
            </Provider>
        )

        expect(screen.getByRole('button')).toHaveClass('isDisabled')
    })

    it('should dispatch export action', () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <DrillDownDownloadButton metricData={metricData} />
            </Provider>
        )

        fireEvent.click(screen.getByRole('button'))

        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: `${EXPORT_TICKET_DRILL_DOWN_JOB_ACTION}/pending`,
            })
        )
    })

    it('should render requested label after button click', () => {
        const store = mockStore({
            ...defaultState,
            ui: {
                [drillDownSlice.name]: {
                    ...initialState,
                    export: {
                        isRequested: true,
                        isLoading: false,
                        isError: false,
                    },
                },
            },
        })

        render(
            <Provider store={store}>
                <DrillDownDownloadButton metricData={metricData} />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button'))

        expect(screen.getByText(DOWNLOAD_REQUESTED_LABEL)).toBeInTheDocument()
    })

    it('should render loading label', () => {
        const store = mockStore({
            ...defaultState,
            ui: {
                [drillDownSlice.name]: {
                    ...initialState,
                    export: {
                        isRequested: true,
                        isLoading: true,
                        isError: false,
                    },
                },
            },
        })

        render(
            <Provider store={store}>
                <DrillDownDownloadButton metricData={metricData} />
            </Provider>
        )

        expect(screen.getByText(DOWNLOAD_LOADING_LABEL)).toBeInTheDocument()
    })

    it('should render default state on error', () => {
        const store = mockStore({
            ...defaultState,
            ui: {
                [drillDownSlice.name]: {
                    ...initialState,
                    export: {
                        isRequested: true,
                        isLoading: false,
                        isError: true,
                    },
                },
            },
        })

        render(
            <Provider store={store}>
                <DrillDownDownloadButton metricData={metricData} />
            </Provider>
        )

        expect(
            screen.getByText(
                `Download ${TOTAL_TICKETS_COUNT_PLACEHOLDER} tickets`
            )
        ).toBeInTheDocument()
    })
})
