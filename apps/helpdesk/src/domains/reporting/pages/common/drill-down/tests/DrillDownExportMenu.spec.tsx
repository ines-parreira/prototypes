import { assumeMock, render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { EXPORT_WARNING_TITLE } from 'domains/reporting/pages/common/drill-down/constants'
import {
    DOWNLOAD_LOADING_LABEL,
    DOWNLOAD_REQUESTED_LABEL,
    DrillDownExportMenu,
} from 'domains/reporting/pages/common/drill-down/DrillDownExportMenu'

import type { AgentsMetrics } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    drillDownSlice,
    EXPORT_DRILL_DOWN_JOB_ACTION,
    initialState,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    getCleanStatsFilters,
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'domains/reporting/state/ui/stats/selectors'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { agents } from 'fixtures/agents'
import { user } from 'fixtures/users'
import { useRunningJobs } from 'jobs'
import type { RootState } from 'state/types'

jest.mock('domains/reporting/state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone,
)
const getCleanStatsFiltersWithLogicalOperatorsWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
)
const getCleanStatsFiltersMock = assumeMock(getCleanStatsFilters)
jest.mock('jobs/useRunningJobs')
const mockUseRunningJobs = assumeMock(useRunningJobs)
describe('<DrillDownExportMenu />', () => {
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
            },
        )
        getCleanStatsFiltersMock.mockReturnValue(cleanStatsFilters)
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
        render(<DrillDownExportMenu metricData={metricData} />, {
            storeState: defaultState,
        })
        expect(screen.getByRole('button')).toBeInTheDocument()
    })
    it('should render disabled button when user is not allowed', () => {
        const state = {
            currentUser: fromJS({
                ...agents[0],
                role: { name: UserRole.ObserverAgent },
            }),
            ui: {
                stats: {
                    [drillDownSlice.name]: initialState,
                },
            },
        } as RootState
        render(<DrillDownExportMenu metricData={metricData} />, {
            storeState: state,
        })
        expect(screen.getByRole('button')).toBeAriaDisabled()
    })
    it('should render disabled button when background Jobs are running', () => {
        const state = {
            currentUser: fromJS({
                ...agents[0],
                role: { name: UserRole.Admin },
            }),
            ui: {
                stats: { [drillDownSlice.name]: initialState },
            },
        } as RootState
        mockUseRunningJobs.mockReturnValue({
            running: true,
            refetch: jest.fn(),
            jobs: [],
        })
        render(<DrillDownExportMenu metricData={metricData} />, {
            storeState: state,
        })
        expect(screen.getByRole('button')).toBeAriaDisabled()
    })
    it('should dispatch export action', async () => {
        const { store } = render(
            <DrillDownExportMenu metricData={metricData} />,
            { storeState: defaultState },
        )
        fireEvent.click(screen.getByRole('button'))
        fireEvent.click(
            await screen.findByRole('menuitem', {
                name: /export metadata only/i,
            }),
        )
        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: `${EXPORT_DRILL_DOWN_JOB_ACTION}/pending`,
            }),
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
        render(<DrillDownExportMenu metricData={metricData} />, {
            storeState: state,
        })
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
        render(<DrillDownExportMenu metricData={metricData} />, {
            storeState: state,
        })
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
        render(<DrillDownExportMenu metricData={metricData} />, {
            storeState: state,
        })
        expect(screen.getByText('Export')).toBeInTheDocument()
    })
    it('should render disabled button when data is fetching', () => {
        render(
            <DrillDownExportMenu metricData={metricData} isFetching={true} />,
            { storeState: defaultState },
        )
        expect(screen.getByRole('button')).toBeAriaDisabled()
    })
    it('should show warning banner when period exceeds 30 days', async () => {
        getCleanStatsFiltersMock.mockReturnValue({
            period: {
                start_datetime: '2024-01-01T00:00:00.000',
                end_datetime: '2024-02-01T00:00:00.000',
            },
        })
        render(<DrillDownExportMenu metricData={metricData} />, {
            storeState: defaultState,
        })
        fireEvent.click(screen.getByRole('button'))
        expect(
            await screen.findByText(EXPORT_WARNING_TITLE),
        ).toBeInTheDocument()
    })
})
