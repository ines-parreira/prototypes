import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import {
    fireEvent,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import {fromJS} from 'immutable'

import React from 'react'
import {useParams} from 'react-router-dom'

import {AGENT_ROLE, BASIC_AGENT_ROLE} from 'config/user'
import {user} from 'fixtures/users'
import {useUpdateDashboard} from 'hooks/reporting/custom-reports/useUpdateDashboard'
import {useUpdateDashboardCache} from 'hooks/reporting/custom-reports/useUpdateDashboardCache'
import useAppDispatch from 'hooks/useAppDispatch'
import {FiltersPanelWrapper} from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {CREATE_REPORT_DESCRIPTION} from 'pages/stats/custom-reports/CreateCustomReport/CreateCustomReport'
import {CustomReport} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportActionButton} from 'pages/stats/custom-reports/CustomReportActionButton'
import {
    CUSTOM_REPORT_ID_CTA,
    CUSTOM_REPORT_SCHEMA_ERROR,
    CustomReportPage,
} from 'pages/stats/custom-reports/CustomReportPage'
import {
    CustomReportChildType,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import {DrillDownModal} from 'pages/stats/DrillDownModal'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('state/notifications/actions')

jest.mock('hooks/reporting/custom-reports/useUpdateDashboard')
const useUpdateDashboardMock = assumeMock(useUpdateDashboard)

jest.mock('hooks/reporting/custom-reports/useUpdateDashboardCache')
const useUpdateDashboardCacheMock = assumeMock(useUpdateDashboardCache)

jest.mock('@gorgias/api-queries')
const useGetAnalyticsCustomReportMock = assumeMock(useGetAnalyticsCustomReport)

jest.mock('pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper')
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)

jest.mock('pages/stats/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)

jest.mock('pages/stats/custom-reports/CustomReport')
const CustomReportMock = assumeMock(CustomReport)

const mockUseParams = assumeMock(useParams)
const customReportId = '2'

jest.mock('pages/stats/custom-reports/CustomReportActionButton')
const CustomReportActionButtonMock = assumeMock(CustomReportActionButton)

describe('CustomReportPage', () => {
    const defaultState = {
        currentUser: fromJS({...user, role: {name: AGENT_ROLE}}),
    }

    const dashboardName = 'Dashboard'

    const customReport: CustomReportSchema = {
        id: Number(customReportId),
        analytics_filter_id: 1,
        name: dashboardName,
        emoji: null,
        children: [
            {
                type: CustomReportChildType.Chart,
                config_id: 'config_id',
            },
        ],
    }

    const updateDashboardMock = jest.fn()

    const dispatchMock = jest.fn()

    const updateDashboardCacheMock = jest.fn()

    const MOVE_CHART_BUTTON = 'chart move'
    const MOVE_CHART_END_BUTTON = 'chart move end'

    beforeEach(() => {
        mockUseParams.mockReturnValue({
            id: customReportId,
        })

        FiltersPanelWrapperMock.mockReturnValue(<div />)

        CustomReportMock.mockImplementation(({onChartMove, onChartMoveEnd}) => (
            <div>
                <button onClick={() => onChartMove(customReport)}>
                    {MOVE_CHART_BUTTON}
                </button>
                <button onClick={() => onChartMoveEnd()}>
                    {MOVE_CHART_END_BUTTON}
                </button>
            </div>
        ))

        DrillDownModalMock.mockReturnValue(<div />)

        CustomReportActionButtonMock.mockImplementation(({setOpenModal}) => (
            <button onClick={() => setOpenModal(true)}>
                {CUSTOM_REPORT_ID_CTA}
            </button>
        ))

        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: {data: customReport},
            isLoading: false,
        } as any)

        useUpdateDashboardMock.mockReturnValue({
            updateDashboard: updateDashboardMock,
            isLoading: false,
        })

        useUpdateDashboardCacheMock.mockReturnValue(updateDashboardCacheMock)

        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    it('should render fallback when no charts are present', () => {
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: {data: {...customReport, children: []}},
            isLoading: false,
        } as any)

        renderWithStore(<CustomReportPage />, defaultState)

        expect(screen.getByText(CREATE_REPORT_DESCRIPTION)).toBeInTheDocument()
    })

    it('should render actions button', () => {
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: {
                data: {
                    ...customReport,
                    children: [
                        {
                            children: [
                                {
                                    config_id:
                                        'customer_satisfaction_trend_card',
                                    type: 'chart',
                                },
                            ],
                            type: 'row',
                        },
                    ],
                },
            },
            isLoading: false,
        } as any)

        renderWithStore(<CustomReportPage />, defaultState)

        expect(screen.getByText(CUSTOM_REPORT_ID_CTA)).toBeInTheDocument()
    })

    it('should not render actions button when user is not admin', () => {
        const state = {
            ...defaultState,
            currentUser: fromJS({
                ...user,
                role: {name: BASIC_AGENT_ROLE},
            }),
        }
        renderWithStore(<CustomReportPage />, state)

        expect(screen.queryByText(CUSTOM_REPORT_ID_CTA)).not.toBeInTheDocument()
    })

    it('should render the loading spinner', () => {
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        renderWithStore(<CustomReportPage />, {})

        expect(screen.getByText(/Loading/i))
    })

    it('should render error on incorrect schema', () => {
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as any)

        renderWithStore(<CustomReportPage />, {})

        expect(screen.getByText(CUSTOM_REPORT_SCHEMA_ERROR))
    })

    it('should update name when input is blurred', async () => {
        renderWithStore(<CustomReportPage />, {})

        const nameInput = screen.getByRole('textbox', {name: 'Dashboard name'})

        fireEvent.change(nameInput, {target: {value: 'Some new name'}})

        fireEvent.blur(nameInput)

        await waitFor(() => {
            expect(updateDashboardMock).toHaveBeenCalledTimes(1)
        })
    })

    it('should _not_ update name when name is less than 2 characters', async () => {
        renderWithStore(<CustomReportPage />, {})

        const nameInput = screen.getByRole('textbox', {name: 'Dashboard name'})

        fireEvent.change(nameInput, {target: {value: 'a'}})

        fireEvent.blur(nameInput)

        await waitFor(() => {
            expect(updateDashboardMock).not.toHaveBeenCalled()
        })
    })

    it('should notify on update name error', async () => {
        const errorMessage = 'Bad Request'
        updateDashboardMock.mockRejectedValue(new Error(errorMessage))

        renderWithStore(<CustomReportPage />, {})

        const nameInput = screen.getByRole('textbox', {name: 'Dashboard name'})

        fireEvent.change(nameInput, {target: {value: 'Some new name'}})

        fireEvent.blur(nameInput)

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledTimes(1)

            expect(notify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: errorMessage,
                    status: NotificationStatus.Error,
                })
            )
        })
    })

    it('should update charts when modal is saved', async () => {
        renderWithStore(<CustomReportPage />, defaultState)

        const actionButton = screen.getByText(CUSTOM_REPORT_ID_CTA)

        fireEvent.click(actionButton)

        const searchInput = screen.getByRole('textbox', {name: 'Search charts'})
        fireEvent.change(searchInput, {
            target: {value: 'messages'},
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
        updateDashboardMock.mockResolvedValue({
            data: {id: customReportId},
        })

        renderWithStore(<CustomReportPage />, defaultState)

        const actionButton = screen.getByText(CUSTOM_REPORT_ID_CTA)

        fireEvent.click(actionButton)

        const searchInput = screen.getByRole('textbox', {name: 'Search charts'})
        fireEvent.change(searchInput, {
            target: {value: 'messages'},
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (2)')
        fireEvent.click(saveButton)

        await waitForElementToBeRemoved(() =>
            screen.getByRole('textbox', {name: 'Search charts'})
        )

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledTimes(1)

            expect(notify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: `Successfully saved 2 charts to ${dashboardName}`,
                    status: NotificationStatus.Success,
                })
            )
        })
    })

    it('should show correct notification message when charts are updated', async () => {
        updateDashboardMock.mockResolvedValue({
            data: {id: customReportId},
        })

        renderWithStore(<CustomReportPage />, defaultState)

        const actionButton = screen.getByText(CUSTOM_REPORT_ID_CTA)

        fireEvent.click(actionButton)

        const searchInput = screen.getByRole('textbox', {name: 'Search charts'})
        fireEvent.change(searchInput, {
            target: {value: 'messages'},
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const secondCheckbox = screen.getAllByRole('checkbox')[1]
        fireEvent.click(secondCheckbox)

        const saveButton = screen.getByText('Add Charts (3)')
        fireEvent.click(saveButton)

        await waitForElementToBeRemoved(() =>
            screen.getByRole('textbox', {name: 'Search charts'})
        )

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledTimes(1)

            expect(notify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: `Successfully saved 3 charts to ${dashboardName}`,
                    status: NotificationStatus.Success,
                })
            )
        })
    })

    it('should notify on update charts error', async () => {
        const errorMessage = 'Bad Request'
        updateDashboardMock.mockRejectedValue(new Error(errorMessage))

        renderWithStore(<CustomReportPage />, defaultState)

        const actionButton = screen.getByText(CUSTOM_REPORT_ID_CTA)

        fireEvent.click(actionButton)

        const searchInput = screen.getByRole('textbox', {name: 'Search charts'})
        fireEvent.change(searchInput, {
            target: {value: 'Average CSAT'},
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (2)')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledTimes(1)

            expect(notify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: errorMessage,
                    status: NotificationStatus.Error,
                })
            )
        })
    })

    it('should update dashboard cache when charts are moved', () => {
        renderWithStore(<CustomReportPage />, defaultState)

        const chartMoveButton = screen.getByRole('button', {
            name: MOVE_CHART_BUTTON,
        })
        fireEvent.click(chartMoveButton)

        expect(updateDashboardCacheMock).toHaveBeenCalledTimes(1)
    })

    it('should update dashboard when charts are moved', () => {
        renderWithStore(<CustomReportPage />, defaultState)

        const chartMoveButton = screen.getByRole('button', {
            name: MOVE_CHART_END_BUTTON,
        })
        fireEvent.click(chartMoveButton)

        expect(updateDashboardMock).toHaveBeenCalledTimes(1)
    })

    it('should notify on update dashboard error', async () => {
        const errorMessage = 'Bad Request'
        updateDashboardMock.mockRejectedValue(new Error(errorMessage))

        renderWithStore(<CustomReportPage />, defaultState)

        const chartMoveButton = screen.getByRole('button', {
            name: MOVE_CHART_END_BUTTON,
        })

        fireEvent.click(chartMoveButton)

        await waitFor(() => {
            expect(notify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: errorMessage,
                    status: NotificationStatus.Error,
                })
            )
        })
    })
})
