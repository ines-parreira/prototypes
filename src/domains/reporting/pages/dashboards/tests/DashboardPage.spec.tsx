import {
    fireEvent,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import { fromJS } from 'immutable'
import { useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { AGENT_ROLE, BASIC_AGENT_ROLE } from 'config/user'
import { useFlag } from 'core/flags'
import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { useDashboardById } from 'domains/reporting/hooks/dashboards/useDashboardById'
import { useDashboardNameValidation } from 'domains/reporting/hooks/dashboards/useDashboardNameValidation'
import { useReportRestrictions } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { useUpdateDashboardCache } from 'domains/reporting/hooks/dashboards/useUpdateDashboardCache'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { CREATE_REPORT_DESCRIPTION } from 'domains/reporting/pages/dashboards/CreateDashboard/CreateDashboard'
import { Dashboard } from 'domains/reporting/pages/dashboards/Dashboard'
import { DashboardActionButton } from 'domains/reporting/pages/dashboards/DashboardActionButton'
import {
    DASHBOARD_SCHEMA_ERROR,
    DashboardPage,
} from 'domains/reporting/pages/dashboards/DashboardPage'
import { PinnedFilterSyncProvider } from 'domains/reporting/pages/dashboards/PinnedFilterSyncProvider'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { dashboardFromApi } from 'domains/reporting/pages/dashboards/utils'
import { user } from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))
const mockUseParams = assumeMock(useParams)

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('domains/reporting/hooks/dashboards/useUpdateDashboardCache')
const useUpdateDashboardCacheMock = assumeMock(useUpdateDashboardCache)

jest.mock('domains/reporting/hooks/dashboards/useDashboardById')
const useDashboardByIdMock = assumeMock(useDashboardById)

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
)
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)

jest.mock('domains/reporting/pages/dashboards/Dashboard')
const DashboardMock = assumeMock(Dashboard)

jest.mock('domains/reporting/pages/dashboards/DashboardActionButton')
const DashboardActionButtonMock = assumeMock(DashboardActionButton)

jest.mock('domains/reporting/hooks/dashboards/useDashboardNameValidation')
const useDashboardNameValidationMock = assumeMock(useDashboardNameValidation)

jest.mock('domains/reporting/hooks/dashboards/useReportRestrictions')
const useReportRestrictionsMock = assumeMock(useReportRestrictions)

jest.mock('domains/reporting/hooks/dashboards/useDashboardActions')
const useDashboardActionsMock = assumeMock(useDashboardActions)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

jest.mock('domains/reporting/pages/dashboards/PinnedFilterSyncProvider')
const PinnedFilterSyncProviderMock = assumeMock(PinnedFilterSyncProvider)

const MOCKED_BUTTON_LABEL = 'some button name'

describe('DashboardPage', () => {
    const defaultState = {
        currentUser: fromJS({ ...user, role: { name: AGENT_ROLE } }),
    }

    const dashboardId = '2'
    const dashboardName = 'Dashboard'

    const dashboard = dashboardFromApi({
        id: Number(dashboardId),
        analytics_filter_id: null,
        name: dashboardName,
        emoji: null,
        type: 'custom',
        account_id: 1,
        created_by: 2,
        updated_by: 2,
        created_datetime: '2023-01-01T00:00:00.000Z',
        updated_datetime: '2023-01-01T00:00:00.000Z',
        deleted_datetime: null,
        children: [
            {
                type: DashboardChildType.Row,
                metadata: {},
                children: [
                    {
                        type: DashboardChildType.Chart,
                        metadata: {},
                        config_id: 'customer_satisfaction_trend_card',
                    },
                ],
            },
        ],
    })!

    const updateDashboardMock = jest.fn()

    const dispatchMock = jest.fn()

    const updateDashboardCacheMock = jest.fn()

    const MOVE_CHART_BUTTON = 'chart move'
    const MOVE_CHART_END_BUTTON = 'chart move end'
    const PIN_FILTER_BUTTON = 'pin filter'

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)

        mockUseParams.mockReturnValue({
            id: dashboardId,
        })

        FiltersPanelWrapperMock.mockReturnValue(<div />)

        DashboardMock.mockImplementation(
            ({ onChartMove, onChartMoveEnd, pinnedFilter }) => (
                <div>
                    <button onClick={() => onChartMove(dashboard)}>
                        {MOVE_CHART_BUTTON}
                    </button>
                    <button onClick={() => onChartMoveEnd()}>
                        {MOVE_CHART_END_BUTTON}
                    </button>
                    {pinnedFilter && (
                        <button onClick={() => pinnedFilter.pin(123)}>
                            {PIN_FILTER_BUTTON}
                        </button>
                    )}
                </div>
            ),
        )

        DrillDownModalMock.mockReturnValue(<div />)

        DashboardActionButtonMock.mockImplementation(({ setOpenModal }) => (
            <button onClick={() => setOpenModal(true)}>
                {MOCKED_BUTTON_LABEL}
            </button>
        ))

        PinnedFilterSyncProviderMock.mockImplementation(({ children }) => (
            <>{children}</>
        ))

        useDashboardByIdMock.mockReturnValue({
            data: dashboard,
            isLoading: false,
        } as any)

        useDashboardActionsMock.mockReturnValue({
            updateDashboardHandler: ({
                onSuccess,
            }: {
                onSuccess?: () => void
            }) => {
                updateDashboardMock()
                onSuccess && onSuccess()
            },
            isUpdateMutationLoading: false,
        } as any)

        useUpdateDashboardCacheMock.mockReturnValue(updateDashboardCacheMock)

        useAppDispatchMock.mockReturnValue(dispatchMock)

        useDashboardNameValidationMock.mockReturnValue({
            error: undefined,
            isValid: true,
            isInvalid: false,
        } as any)
        useReportRestrictionsMock.mockReturnValue({
            reportRestrictionsMap: {},
            chartRestrictionsMap: {},
            moduleRestrictionsMap: {},
        })
    })

    it('should render fallback when no charts are present', () => {
        useDashboardByIdMock.mockReturnValue({
            data: { ...dashboard, children: [] },
            isLoading: false,
        } as any)

        renderWithStore(<DashboardPage />, defaultState)

        expect(screen.getByText(CREATE_REPORT_DESCRIPTION)).toBeInTheDocument()
    })

    it('should render actions button', () => {
        renderWithStore(<DashboardPage />, defaultState)

        expect(screen.getByText(MOCKED_BUTTON_LABEL)).toBeInTheDocument()
    })

    it('should not render actions button when user is not admin', () => {
        const state = {
            ...defaultState,
            currentUser: fromJS({
                ...user,
                role: { name: BASIC_AGENT_ROLE },
            }),
        }
        renderWithStore(<DashboardPage />, state)

        expect(screen.queryByText(MOCKED_BUTTON_LABEL)).not.toBeInTheDocument()
    })

    it('should render the loading spinner', () => {
        useDashboardByIdMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        renderWithStore(<DashboardPage />, {})

        expect(screen.getByText(/Loading/i))
    })

    it('should render error on incorrect schema', () => {
        useDashboardByIdMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as any)

        renderWithStore(<DashboardPage />, {})

        expect(screen.getByText(DASHBOARD_SCHEMA_ERROR))
    })

    it('should wrap in PinnedFilterSyncProvider when analytics_filter_id is present', () => {
        useFlagMock.mockReturnValue(true)
        useDashboardByIdMock.mockReturnValue({
            data: { ...dashboard, analytics_filter_id: 1 },
            isLoading: false,
        } as any)

        renderWithStore(<DashboardPage />, {})

        expect(PinnedFilterSyncProviderMock).toHaveBeenCalled()
    })

    it('should not wrap in PinnedFilterSyncProvider if flag is disabled', () => {
        useDashboardByIdMock.mockReturnValue({
            data: { ...dashboard, analytics_filter_id: 1 },
            isLoading: false,
        } as any)

        renderWithStore(<DashboardPage />, {})

        expect(PinnedFilterSyncProviderMock).not.toHaveBeenCalled()
    })

    it('should update name when input is blurred', async () => {
        renderWithStore(<DashboardPage />, {})

        const nameInput = screen.getByRole('textbox', {
            name: 'Dashboard name',
        })

        fireEvent.change(nameInput, { target: { value: 'Some new name' } })

        fireEvent.blur(nameInput)

        await waitFor(() => {
            expect(updateDashboardMock).toHaveBeenCalledTimes(1)
        })
    })

    it('should report Event when Actions menu clicked', () => {
        renderWithStore(<DashboardPage />, defaultState)

        const actionButton = screen.getByText(MOCKED_BUTTON_LABEL)

        fireEvent.click(actionButton)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDashboardActionsMenuClicked,
        )
    })

    it('should update charts when modal is saved', async () => {
        renderWithStore(<DashboardPage />, defaultState)

        const actionButton = screen.getByText(MOCKED_BUTTON_LABEL)

        fireEvent.click(actionButton)

        const searchInput = screen.getByRole('textbox', {
            name: 'Search charts',
        })
        fireEvent.change(searchInput, {
            target: { value: 'messages' },
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (2)')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(updateDashboardMock).toHaveBeenCalledTimes(1)
        })
    })

    it('should notify on success and close modal', async () => {
        renderWithStore(<DashboardPage />, defaultState)

        const actionButton = screen.getByText(MOCKED_BUTTON_LABEL)

        fireEvent.click(actionButton)

        const searchInput = screen.getByRole('textbox', {
            name: 'Search charts',
        })
        fireEvent.change(searchInput, {
            target: { value: 'messages' },
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (2)')
        fireEvent.click(saveButton)

        await waitForElementToBeRemoved(() =>
            screen.getByRole('textbox', { name: 'Search charts' }),
        )

        await waitFor(() => {
            expect(updateDashboardMock).toHaveBeenCalledTimes(1)
        })
    })

    it('should show correct notification message when charts are updated', async () => {
        renderWithStore(<DashboardPage />, defaultState)

        const actionButton = screen.getByText(MOCKED_BUTTON_LABEL)

        fireEvent.click(actionButton)

        const searchInput = screen.getByRole('textbox', {
            name: 'Search charts',
        })
        fireEvent.change(searchInput, {
            target: { value: 'messages' },
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const secondCheckbox = screen.getAllByRole('checkbox')[1]
        fireEvent.click(secondCheckbox)

        const saveButton = screen.getByText('Add Charts (3)')
        fireEvent.click(saveButton)

        await waitForElementToBeRemoved(() =>
            screen.getByRole('textbox', { name: 'Search charts' }),
        )

        await waitFor(() => {
            expect(updateDashboardMock).toHaveBeenCalledTimes(1)
        })
    })

    it('should update dashboard cache when charts are moved', () => {
        renderWithStore(<DashboardPage />, defaultState)

        const chartMoveButton = screen.getByRole('button', {
            name: MOVE_CHART_BUTTON,
        })
        fireEvent.click(chartMoveButton)

        expect(updateDashboardCacheMock).toHaveBeenCalledTimes(1)
    })

    it('should update dashboard when charts are moved', () => {
        renderWithStore(<DashboardPage />, defaultState)

        const chartMoveButton = screen.getByRole('button', {
            name: MOVE_CHART_END_BUTTON,
        })
        fireEvent.click(chartMoveButton)

        expect(updateDashboardMock).toHaveBeenCalledTimes(1)
    })

    describe('Pinned Filter functionality', () => {
        let mockUpdateDashboardHandler: jest.Mock

        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
            mockUpdateDashboardHandler = jest.fn()
            useDashboardActionsMock.mockReturnValue({
                updateDashboardHandler: mockUpdateDashboardHandler,
                isUpdateMutationLoading: false,
            } as any)
        })

        it('should pin a filter when no filter is currently pinned', () => {
            const testDashboard = { ...dashboard, analytics_filter_id: null }
            useDashboardByIdMock.mockReturnValue({
                data: testDashboard,
                isLoading: false,
            } as any)

            renderWithStore(<DashboardPage />, defaultState)

            const pinFilterButton = screen.getByRole('button', {
                name: PIN_FILTER_BUTTON,
            })
            fireEvent.click(pinFilterButton)

            expect(mockUpdateDashboardHandler).toHaveBeenCalledTimes(1)
            expect(mockUpdateDashboardHandler).toHaveBeenCalledWith({
                dashboard: {
                    ...testDashboard,
                    analytics_filter_id: 123,
                },
            })
        })

        it('should unpin a filter when the same filter is already pinned', () => {
            const savedFilterId = 123
            const testDashboard = {
                ...dashboard,
                analytics_filter_id: savedFilterId,
            }
            useDashboardByIdMock.mockReturnValue({
                data: testDashboard,
                isLoading: false,
            } as any)

            // Update the mock to simulate clicking the same filter that's already pinned
            DashboardMock.mockImplementation(({ pinnedFilter }) => (
                <div>
                    {pinnedFilter && (
                        <button onClick={() => pinnedFilter.pin(savedFilterId)}>
                            {PIN_FILTER_BUTTON}
                        </button>
                    )}
                </div>
            ))

            renderWithStore(<DashboardPage />, defaultState)

            const pinFilterButton = screen.getByRole('button', {
                name: PIN_FILTER_BUTTON,
            })
            fireEvent.click(pinFilterButton)

            expect(mockUpdateDashboardHandler).toHaveBeenCalledTimes(1)
            expect(mockUpdateDashboardHandler).toHaveBeenCalledWith({
                dashboard: {
                    ...testDashboard,
                    analytics_filter_id: null,
                },
            })
        })

        it('should switch to a different filter when another filter is already pinned', () => {
            const currentFilterId = 456
            const newFilterId = 123
            const testDashboard = {
                ...dashboard,
                analytics_filter_id: currentFilterId,
            }
            useDashboardByIdMock.mockReturnValue({
                data: testDashboard,
                isLoading: false,
            } as any)

            // Update the mock to simulate clicking a different filter
            DashboardMock.mockImplementation(({ pinnedFilter }) => (
                <div>
                    {pinnedFilter && (
                        <button onClick={() => pinnedFilter.pin(newFilterId)}>
                            {PIN_FILTER_BUTTON}
                        </button>
                    )}
                </div>
            ))

            renderWithStore(<DashboardPage />, defaultState)

            const pinFilterButton = screen.getByRole('button', {
                name: PIN_FILTER_BUTTON,
            })
            fireEvent.click(pinFilterButton)

            expect(mockUpdateDashboardHandler).toHaveBeenCalledTimes(1)
            expect(mockUpdateDashboardHandler).toHaveBeenCalledWith({
                dashboard: {
                    ...testDashboard,
                    analytics_filter_id: newFilterId,
                },
            })
        })

        it('should pass the correct pinned filter id to Dashboard component', () => {
            const savedFilterId = 789
            useDashboardByIdMock.mockReturnValue({
                data: { ...dashboard, analytics_filter_id: savedFilterId },
                isLoading: false,
            } as any)

            renderWithStore(<DashboardPage />, defaultState)

            expect(DashboardMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    pinnedFilter: expect.objectContaining({
                        id: savedFilterId,
                        pin: expect.any(Function),
                    }),
                }),
                expect.anything(),
            )
        })

        it('should not pass pinnedFilter when feature flag is disabled', () => {
            useFlagMock.mockReturnValue(false)
            const savedFilterId = 789
            useDashboardByIdMock.mockReturnValue({
                data: { ...dashboard, analytics_filter_id: savedFilterId },
                isLoading: false,
            } as any)

            renderWithStore(<DashboardPage />, defaultState)

            expect(DashboardMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    pinnedFilter: undefined,
                }),
                expect.anything(),
            )
        })

        it('should not pass pinnedFilter when no filter is pinned', () => {
            useDashboardByIdMock.mockReturnValue({
                data: { ...dashboard, analytics_filter_id: null },
                isLoading: false,
            } as any)

            renderWithStore(<DashboardPage />, defaultState)

            expect(DashboardMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    pinnedFilter: expect.objectContaining({
                        id: null,
                        pin: expect.any(Function),
                    }),
                }),
                expect.anything(),
            )
        })
    })
})
