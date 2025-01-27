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
import useAppDispatch from 'hooks/useAppDispatch'
import {FiltersPanelWrapper} from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {CustomReport} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportActionButton} from 'pages/stats/custom-reports/CustomReportActionButton'
import {
    CUSTOM_REPORT_ID_CTA,
    CUSTOM_REPORT_SCHEMA_ERROR,
    CustomReportPage,
} from 'pages/stats/custom-reports/CustomReportPage'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'
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
        children: [],
    }

    const updateDashboardMock = jest.fn()

    const dispatchMock = jest.fn()

    beforeEach(() => {
        mockUseParams.mockReturnValue({
            id: customReportId,
        })

        FiltersPanelWrapperMock.mockReturnValue(<div />)

        CustomReportMock.mockReturnValue(<div />)

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

        useAppDispatchMock.mockReturnValue(dispatchMock)
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

        const saveButton = screen.getByText('Add Charts (1)')
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

        const saveButton = screen.getByText('Add Charts (1)')
        fireEvent.click(saveButton)

        await waitForElementToBeRemoved(() =>
            screen.getByRole('textbox', {name: 'Search charts'})
        )

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledTimes(1)

            expect(notify).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: `Successfully saved 1 chart to ${dashboardName}`,
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

    it('should notify on update charts error', async () => {
        const errorMessage = 'Bad Request'
        updateDashboardMock.mockRejectedValue(new Error(errorMessage))

        renderWithStore(<CustomReportPage />, defaultState)

        const actionButton = screen.getByText(CUSTOM_REPORT_ID_CTA)

        fireEvent.click(actionButton)

        const searchInput = screen.getByRole('textbox', {name: 'Search charts'})
        fireEvent.change(searchInput, {
            target: {value: 'Average CAST'},
        })

        const firstCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(firstCheckbox)

        const saveButton = screen.getByText('Add Charts (1)')
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
})
