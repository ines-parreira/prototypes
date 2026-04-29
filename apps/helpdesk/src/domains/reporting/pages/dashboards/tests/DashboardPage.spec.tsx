import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import {
    fireEvent,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import { fromJS } from 'immutable'
import { useParams } from 'react-router-dom'

import { AGENT_ROLE, BASIC_AGENT_ROLE } from 'config/user'
import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { useDashboardById } from 'domains/reporting/hooks/dashboards/useDashboardById'
import { useDashboardNameValidation } from 'domains/reporting/hooks/dashboards/useDashboardNameValidation'
import { useReportRestrictions } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { AnalyticsCustomDashboard } from 'domains/reporting/pages/dashboards/AnalyticsCustomDashboard'
import { CREATE_REPORT_DESCRIPTION } from 'domains/reporting/pages/dashboards/CreateDashboard/CreateDashboard'
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

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
const mockUseParams = assumeMock(useParams)

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('domains/reporting/hooks/dashboards/useDashboardById')
const useDashboardByIdMock = assumeMock(useDashboardById)

jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper',
)
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)

jest.mock('domains/reporting/pages/dashboards/AnalyticsCustomDashboard')
const AnalyticsCustomDashboardMock = assumeMock(AnalyticsCustomDashboard)

jest.mock('domains/reporting/pages/dashboards/DashboardActionButton')
const DashboardActionButtonMock = assumeMock(DashboardActionButton)

jest.mock('domains/reporting/hooks/dashboards/useDashboardNameValidation')
const useDashboardNameValidationMock = assumeMock(useDashboardNameValidation)

jest.mock('domains/reporting/hooks/dashboards/useReportRestrictions')
const useReportRestrictionsMock = assumeMock(useReportRestrictions)

jest.mock('domains/reporting/hooks/dashboards/useDashboardActions')
const useDashboardActionsMock = assumeMock(useDashboardActions)

jest.mock('@repo/logging')
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

    const PIN_FILTER_BUTTON = 'pin filter'

    beforeEach(() => {
        mockUseParams.mockReturnValue({
            id: dashboardId,
        })

        FiltersPanelWrapperMock.mockReturnValue(<div />)

        AnalyticsCustomDashboardMock.mockImplementation(({ pinnedFilter }) => (
            <div>
                Dashboard Report with Resize & Drag&Drop
                {pinnedFilter && (
                    <button onClick={() => pinnedFilter.pin(123, 'filter')}>
                        {PIN_FILTER_BUTTON}
                    </button>
                )}
            </div>
        ))

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

        useAppDispatchMock.mockReturnValue(dispatchMock)

        useDashboardNameValidationMock.mockReturnValue({
            error: undefined,
            isValid: true,
            isInvalid: false,
        } as any)
        useReportRestrictionsMock.mockReturnValue({
            reportRestrictionsMap: {},
            moduleRestrictionsMap: {},
        })
    })

    it('should render fallback when no charts are present', () => {
        useDashboardByIdMock.mockReturnValue({
            data: { ...dashboard, children: [] },
            isLoading: false,
        } as any)

        render(<DashboardPage />, { storeState: defaultState })

        expect(screen.getByText(CREATE_REPORT_DESCRIPTION)).toBeInTheDocument()
    })

    it('should render actions button', () => {
        render(<DashboardPage />, { storeState: defaultState })

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
        render(<DashboardPage />, { storeState: state })

        expect(screen.queryByText(MOCKED_BUTTON_LABEL)).not.toBeInTheDocument()
    })

    it('should render the loading spinner', () => {
        useDashboardByIdMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        render(<DashboardPage />)

        expect(screen.getByText(/Loading/i))
    })

    it('should render error on incorrect schema', () => {
        useDashboardByIdMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as any)

        render(<DashboardPage />)

        expect(screen.getByText(DASHBOARD_SCHEMA_ERROR))
    })

    it('should wrap in PinnedFilterSyncProvider when analytics_filter_id is present', () => {
        useDashboardByIdMock.mockReturnValue({
            data: { ...dashboard, analytics_filter_id: 1 },
            isLoading: false,
        } as any)

        render(<DashboardPage />)

        expect(PinnedFilterSyncProviderMock).toHaveBeenCalled()
    })

    it('should update name when input is blurred', async () => {
        render(<DashboardPage />)

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
        render(<DashboardPage />, { storeState: defaultState })

        const actionButton = screen.getByText(MOCKED_BUTTON_LABEL)

        fireEvent.click(actionButton)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatDashboardActionsMenuClicked,
        )
    })

    it('should update charts when modal is saved', async () => {
        render(<DashboardPage />, { storeState: defaultState })

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
        render(<DashboardPage />, { storeState: defaultState })

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
        render(<DashboardPage />, { storeState: defaultState })

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

    it('should render the new dashboard report', () => {
        render(<DashboardPage />, { storeState: defaultState })

        expect(AnalyticsCustomDashboardMock).toHaveBeenCalled()
    })

    describe('Pinned Filter functionality', () => {
        let mockUpdateDashboardHandler: jest.Mock
        const filterName = 'filter'
        const successMessage = `${filterName} has been set as ${dashboardName}'s default filter.`
        const errorMessage = `${filterName} could not be set as default filter. Please try again.`

        beforeEach(() => {
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

            render(<DashboardPage />, { storeState: defaultState })

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
                successMessage,
                errorMessage,
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

            AnalyticsCustomDashboardMock.mockImplementation(
                ({ pinnedFilter }) => (
                    <div>
                        {pinnedFilter && (
                            <button
                                onClick={() =>
                                    pinnedFilter.pin(savedFilterId, filterName)
                                }
                            >
                                {PIN_FILTER_BUTTON}
                            </button>
                        )}
                    </div>
                ),
            )

            render(<DashboardPage />, { storeState: defaultState })

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
                successMessage: `${filterName} has been removed as Dashboard's default filter.`,
                errorMessage,
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

            AnalyticsCustomDashboardMock.mockImplementation(
                ({ pinnedFilter }) => (
                    <div>
                        {pinnedFilter && (
                            <button
                                onClick={() =>
                                    pinnedFilter.pin(newFilterId, filterName)
                                }
                            >
                                {PIN_FILTER_BUTTON}
                            </button>
                        )}
                    </div>
                ),
            )

            render(<DashboardPage />, { storeState: defaultState })

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
                successMessage,
                errorMessage,
            })
        })

        it('should pass the correct pinned filter id to AnalyticsCustomDashboard component', () => {
            const savedFilterId = 789
            useDashboardByIdMock.mockReturnValue({
                data: { ...dashboard, analytics_filter_id: savedFilterId },
                isLoading: false,
            } as any)

            render(<DashboardPage />, { storeState: defaultState })

            expect(AnalyticsCustomDashboardMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    pinnedFilter: expect.objectContaining({
                        id: savedFilterId,
                        pin: expect.any(Function),
                    }),
                }),
                expect.anything(),
            )
        })

        it('should not pass pinnedFilter when no filter is pinned', () => {
            useDashboardByIdMock.mockReturnValue({
                data: { ...dashboard, analytics_filter_id: null },
                isLoading: false,
            } as any)

            render(<DashboardPage />, { storeState: defaultState })

            expect(AnalyticsCustomDashboardMock).toHaveBeenCalledWith(
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
