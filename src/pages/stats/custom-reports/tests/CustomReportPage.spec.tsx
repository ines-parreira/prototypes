import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {useParams} from 'react-router-dom'

import {AGENT_ROLE, BASIC_AGENT_ROLE} from 'config/user'
import {user} from 'fixtures/users'
import {useUpdateCustomReportName} from 'hooks/reporting/custom-reports/useUpdateCustomReportName'
import useAppDispatch from 'hooks/useAppDispatch'
import {FiltersPanelWrapper} from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {CustomReport} from 'pages/stats/custom-reports/CustomReport'
import {CustomReportActionButton} from 'pages/stats/custom-reports/CustomReportActionButton'
import {CustomReportNameForm} from 'pages/stats/custom-reports/CustomReportNameForm'

import {
    CUSTOM_REPORT_ID_CTA,
    CUSTOM_REPORT_SCHEMA_ERROR,
    CustomReportPage,
} from 'pages/stats/custom-reports/CustomReportPage'
import {CustomReportsModal} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'
import {customReportFromApi} from 'pages/stats/custom-reports/utils'
import {DrillDownModal} from 'pages/stats/DrillDownModal'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@gorgias/api-queries')
const useGetAnalyticsCustomReportMock = assumeMock(useGetAnalyticsCustomReport)

jest.mock('hooks/reporting/custom-reports/useUpdateCustomReportName')
const useUpdateCustomReportNameMock = assumeMock(useUpdateCustomReportName)

jest.mock('pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper')
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)

jest.mock('pages/stats/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)

jest.mock('pages/stats/custom-reports/CustomReportsModal/CustomReportsModal')
const AddChartsModalMock = assumeMock(CustomReportsModal)

jest.mock('pages/stats/custom-reports/CustomReportNameForm.tsx')
const CustomReportNameFormMock = assumeMock(CustomReportNameForm)

jest.mock('pages/stats/custom-reports/CustomReport')
const CustomReportMock = assumeMock(CustomReport)

jest.mock('pages/stats/custom-reports/utils')
const customReportFromApiMock = assumeMock(customReportFromApi)

const mockUseParams = assumeMock(useParams)
const customReportId = '2'

jest.mock('pages/stats/custom-reports/CustomReportActionButton')
const CustomReportActionButtonMock = assumeMock(CustomReportActionButton)

describe('CustomReportPage', () => {
    const defaultState = {
        currentUser: fromJS({...user, role: {name: AGENT_ROLE}}),
    }

    const customReport: CustomReportSchema = {
        id: 2,
        analytics_filter_id: 1,
        name: 'some report',
        emoji: null,
        children: [],
    }

    const updateCustomReportMock = jest.fn()

    const dispatchMock = jest.fn()

    beforeEach(() => {
        mockUseParams.mockReturnValue({
            id: customReportId,
        })

        FiltersPanelWrapperMock.mockReturnValue(<div />)

        AddChartsModalMock.mockReturnValue(<div />)

        CustomReportMock.mockReturnValue(<div />)

        CustomReportNameFormMock.mockImplementation(({onSubmit}) => (
            <button onClick={() => onSubmit({name: 'Test Report'})}>
                submit
            </button>
        ))

        DrillDownModalMock.mockReturnValue(<div />)

        CustomReportActionButtonMock.mockReturnValue(
            <div>{CUSTOM_REPORT_ID_CTA}</div>
        )

        useUpdateCustomReportNameMock.mockReturnValue({
            updateCustomReport: updateCustomReportMock,
        } as any)

        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: {data: customReport},
            isLoading: false,
        } as any)

        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    it('should render <CustomReportNameInput />', () => {
        renderWithStore(<CustomReportPage />, {})

        expect(CustomReportNameForm).toHaveBeenCalled()
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

    it('should format the report data correctly', () => {
        renderWithStore(<CustomReportPage />, {})

        expect(customReportFromApiMock).toHaveBeenCalledTimes(1)
    })

    it('should call `updateCustomReport` with correct params', () => {
        renderWithStore(<CustomReportPage />, {})

        expect(useUpdateCustomReportNameMock).toHaveBeenCalledWith(
            customReport.id
        )
    })

    it('should call updateCustomReport when form is submitted', async () => {
        updateCustomReportMock.mockResolvedValueOnce({
            data: {id: customReportId},
        })

        renderWithStore(<CustomReportPage />, {})

        fireEvent.click(screen.getByText('submit'))

        await waitFor(() => {
            expect(updateCustomReportMock).toHaveBeenCalledTimes(1)
        })
    })

    it('should notify on error', async () => {
        updateCustomReportMock.mockRejectedValueOnce(new Error('Bad Request'))

        renderWithStore(<CustomReportPage />, {})

        fireEvent.click(screen.getByText('submit'))

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledTimes(1)
        })
    })
})
