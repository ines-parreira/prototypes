import {
    fireEvent,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import { fromJS } from 'immutable'
import { useParams } from 'react-router-dom'

import {
    AnalyticsCustomReport,
    useGetAnalyticsCustomReport,
} from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { AGENT_ROLE, BASIC_AGENT_ROLE } from 'config/user'
import { user } from 'fixtures/users'
import { useDashboardActions } from 'hooks/reporting/dashboards/useDashboardActions'
import { useDashboardNameValidation } from 'hooks/reporting/dashboards/useDashboardNameValidation'
import { useReportRestrictions } from 'hooks/reporting/dashboards/useReportRestrictions'
import { useUpdateDashboardCache } from 'hooks/reporting/dashboards/useUpdateDashboardCache'
import useAppDispatch from 'hooks/useAppDispatch'
import { DrillDownModal } from 'pages/stats/common/drill-down/DrillDownModal'
import { FiltersPanelWrapper } from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { CREATE_REPORT_DESCRIPTION } from 'pages/stats/dashboards/CreateDashboard/CreateDashboard'
import { Dashboard } from 'pages/stats/dashboards/Dashboard'
import { DashboardActionButton } from 'pages/stats/dashboards/DashboardActionButton'
import {
    DASHBOARD_SCHEMA_ERROR,
    DashboardPage,
} from 'pages/stats/dashboards/DashboardPage'
import { DashboardChildType } from 'pages/stats/dashboards/types'
import { dashboardFromApi } from 'pages/stats/dashboards/utils'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('state/notifications/actions')

jest.mock('hooks/reporting/dashboards/useUpdateDashboardCache')
const useUpdateDashboardCacheMock = assumeMock(useUpdateDashboardCache)

jest.mock('@gorgias/helpdesk-queries')
const useGetAnalyticsCustomReportMock = assumeMock(useGetAnalyticsCustomReport)

jest.mock('pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper')
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)

jest.mock('pages/stats/common/drill-down/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)

jest.mock('pages/stats/dashboards/Dashboard')
const DashboardMock = assumeMock(Dashboard)

const mockUseParams = assumeMock(useParams)

jest.mock('pages/stats/dashboards/DashboardActionButton')
const DashboardActionButtonMock = assumeMock(DashboardActionButton)

jest.mock('hooks/reporting/dashboards/useDashboardNameValidation')
const useDashboardNameValidationMock = assumeMock(useDashboardNameValidation)

jest.mock('hooks/reporting/dashboards/useReportRestrictions')
const useReportRestrictionsMock = assumeMock(useReportRestrictions)

jest.mock('hooks/reporting/dashboards/useDashboardActions')
const useDashboardActionsMock = assumeMock(useDashboardActions)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

const MOCKED_BUTTON_LABEL = 'some button name'

describe('DashboardPage', () => {
    const defaultState = {
        currentUser: fromJS({ ...user, role: { name: AGENT_ROLE } }),
    }

    const dashboardId = '2'
    const dashboardName = 'Dashboard'

    const rawDashboard: AnalyticsCustomReport = {
        id: Number(dashboardId),
        analytics_filter_id: 1,
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
    }

    const dashboard = dashboardFromApi(rawDashboard)!

    const updateDashboardMock = jest.fn()

    const dispatchMock = jest.fn()

    const updateDashboardCacheMock = jest.fn()

    const MOVE_CHART_BUTTON = 'chart move'
    const MOVE_CHART_END_BUTTON = 'chart move end'

    beforeEach(() => {
        mockUseParams.mockReturnValue({
            id: dashboardId,
        })

        FiltersPanelWrapperMock.mockReturnValue(<div />)

        DashboardMock.mockImplementation(({ onChartMove, onChartMoveEnd }) => (
            <div>
                <button onClick={() => onChartMove(dashboard)}>
                    {MOVE_CHART_BUTTON}
                </button>
                <button onClick={() => onChartMoveEnd()}>
                    {MOVE_CHART_END_BUTTON}
                </button>
            </div>
        ))

        DrillDownModalMock.mockReturnValue(<div />)

        DashboardActionButtonMock.mockImplementation(({ setOpenModal }) => (
            <button onClick={() => setOpenModal(true)}>
                {MOCKED_BUTTON_LABEL}
            </button>
        ))

        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: { data: rawDashboard },
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
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: { data: { ...rawDashboard, children: [] } },
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
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        renderWithStore(<DashboardPage />, {})

        expect(screen.getByText(/Loading/i))
    })

    it('should render error on incorrect schema', () => {
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as any)

        renderWithStore(<DashboardPage />, {})

        expect(screen.getByText(DASHBOARD_SCHEMA_ERROR))
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
})
