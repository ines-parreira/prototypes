import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {UserRole} from 'config/types/user'
import {agents} from 'fixtures/agents'
import {user} from 'fixtures/users'
import {useRunningJobs} from 'jobs'
import {ReportingGranularity} from 'models/reporting/types'

import {
    DrillDownDownloadButton,
    DOWNLOAD_REQUESTED_LABEL,
    DOWNLOAD_LOADING_LABEL,
    TOTAL_OBJECTS_COUNT_PLACEHOLDER,
} from 'pages/stats/DrillDownDownloadButton'
import {RootState} from 'state/types'
import {
    AgentsMetrics,
    drillDownSlice,
    EXPORT_DRILL_DOWN_JOB_ACTION,
    initialState,
} from 'state/ui/stats/drillDownSlice'
import {
    getCleanStatsFiltersWithTimezone,
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
} from 'state/ui/stats/selectors'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {assumeMock, renderWithStore} from 'utils/testing'

const mockStore = configureMockStore([thunk])

jest.mock('state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)
const getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone
)

jest.mock('jobs/useRunningJobs')
const mockUseRunningJobs = assumeMock(useRunningJobs)

describe('<DrillDownDownloadButton />', () => {
    const objectType = 'tickets'
    const cleanStatsFilters = {
        period: {
            start_datetime: '1970-01-01T00:00:00+00:00',
            end_datetime: '1970-01-01T00:00:00+00:00',
        },
    }
    beforeEach(() => {
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            userTimezone: 'someTimezone',
            cleanStatsFilters,
            granularity: ReportingGranularity.Day,
        })
        getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock.mockReturnValue(
            {
                userTimezone: 'someTimezone',
                cleanStatsFilters,
                granularity: ReportingGranularity.Day,
            }
        )

        mockUseRunningJobs.mockReturnValue({
            running: false,
            jobs: [],
            refetch: jest.fn(),
        })
    })
    const metricData: AgentsMetrics = {
        metricName: AgentsTableColumn.CustomerSatisfaction,
        perAgentId: 123,
    }

    const defaultState = {
        currentUser: fromJS(user),
        ui: {
            stats: {
                [drillDownSlice.name]: initialState,
            },
        },
    } as RootState

    it('should render button', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownDownloadButton
                    metricData={metricData}
                    objectType={objectType}
                />
            </Provider>
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render disabled button when user is not allowed', () => {
        const state = {
            currentUser: fromJS({
                ...agents[0],
                role: {name: UserRole.ObserverAgent},
            }),
            ui: {
                stats: {
                    [drillDownSlice.name]: initialState,
                },
            },
        } as RootState

        renderWithStore(
            <DrillDownDownloadButton
                metricData={metricData}
                objectType={objectType}
            />,
            state
        )

        expect(screen.getByRole('button')).toBeAriaDisabled()
    })

    it('should render disabled button when background Jobs are running', () => {
        const state = {
            currentUser: fromJS({
                ...agents[0],
                role: {name: UserRole.Admin},
            }),
            ui: {
                stats: {[drillDownSlice.name]: initialState},
            },
        } as RootState
        mockUseRunningJobs.mockReturnValue({
            running: true,
            refetch: jest.fn(),
            jobs: [],
        })
        renderWithStore(
            <DrillDownDownloadButton
                metricData={metricData}
                objectType={objectType}
            />,
            state
        )

        expect(screen.getByRole('button')).toBeAriaDisabled()
    })

    it('should dispatch export action', () => {
        const {store} = renderWithStore(
            <DrillDownDownloadButton
                metricData={metricData}
                objectType={objectType}
            />,
            defaultState
        )

        fireEvent.click(screen.getByRole('button'))

        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: `${EXPORT_DRILL_DOWN_JOB_ACTION}/pending`,
            })
        )
    })

    it('should render requested label after button click', () => {
        const state = {
            ...defaultState,
            ui: {
                stats: {
                    [drillDownSlice.name]: {
                        ...initialState,
                        export: {
                            isRequested: true,
                            isLoading: false,
                            isError: false,
                        },
                    },
                },
            },
        } as RootState

        renderWithStore(
            <DrillDownDownloadButton
                metricData={metricData}
                objectType={objectType}
            />,
            state
        )
        fireEvent.click(screen.getByRole('button'))

        expect(screen.getByText(DOWNLOAD_REQUESTED_LABEL)).toBeInTheDocument()
    })

    it('should render loading label', () => {
        const state = {
            ...defaultState,
            ui: {
                stats: {
                    [drillDownSlice.name]: {
                        ...initialState,
                        export: {
                            isRequested: true,
                            isLoading: true,
                            isError: false,
                        },
                    },
                },
            },
        } as RootState

        renderWithStore(
            <DrillDownDownloadButton
                metricData={metricData}
                objectType={objectType}
            />,
            state
        )

        expect(screen.getByText(DOWNLOAD_LOADING_LABEL)).toBeInTheDocument()
    })

    it('should render default state on error', () => {
        const state = {
            ...defaultState,
            ui: {
                stats: {
                    [drillDownSlice.name]: {
                        ...initialState,
                        export: {
                            isRequested: true,
                            isLoading: false,
                            isError: true,
                        },
                    },
                },
            },
        } as RootState

        renderWithStore(
            <DrillDownDownloadButton
                metricData={metricData}
                objectType={objectType}
            />,
            state
        )

        expect(
            screen.getByText(
                `Download ${TOTAL_OBJECTS_COUNT_PLACEHOLDER} tickets`
            )
        ).toBeInTheDocument()
    })
})
