import {useGetAnalyticsCustomReport} from '@gorgias/api-queries'
import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {useParams} from 'react-router-dom'

import {AGENT_ROLE, BASIC_AGENT_ROLE} from 'config/user'
import {user} from 'fixtures/users'
import {FiltersPanelWrapper} from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {CustomReportActionButton} from 'pages/stats/custom-reports/CustomReportActionButton'
import {CustomReportNameInput} from 'pages/stats/custom-reports/CustomReportNameInput'
import {
    CUSTOM_REPORT_ID_CTA,
    CUSTOM_REPORT_SCHEMA_ERROR,
    CustomReportPage,
} from 'pages/stats/custom-reports/CustomReportPage'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'
import {DrillDownModal} from 'pages/stats/DrillDownModal'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('@gorgias/api-queries')
const useGetAnalyticsCustomReportMock = assumeMock(useGetAnalyticsCustomReport)

jest.mock('pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper')
const FiltersPanelWrapperMock = assumeMock(FiltersPanelWrapper)
jest.mock('pages/stats/DrillDownModal')
const DrillDownModalMock = assumeMock(DrillDownModal)
jest.mock('pages/stats/custom-reports/CustomReportNameInput.tsx')
const CustomReportNameInputMock = assumeMock(CustomReportNameInput)
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
        analytics_filter_id: null,
        name: 'some report',
        emoji: null,
        children: [],
    }

    beforeEach(() => {
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: {data: customReport},
            isLoading: false,
        } as any)
        FiltersPanelWrapperMock.mockReturnValue(<div />)
        CustomReportNameInputMock.mockReturnValue(<div />)
        DrillDownModalMock.mockReturnValue(<div />)
        CustomReportActionButtonMock.mockReturnValue(
            <div>{CUSTOM_REPORT_ID_CTA}</div>
        )
    })

    it('should render the component', () => {
        mockUseParams.mockReturnValue({
            id: customReportId,
        })

        renderWithStore(<CustomReportPage />, {})

        expect(CustomReportNameInputMock).toHaveBeenCalledWith(
            expect.objectContaining({
                initialValues: expect.objectContaining({
                    name: customReport.name,
                    emoji: customReport.emoji,
                }),
            }),
            {}
        )
    })

    it('should render <CustomReportNameInput />', () => {
        renderWithStore(<CustomReportPage />, {})

        expect(CustomReportNameInput).toHaveBeenCalled()
    })

    it('should render actions button', () => {
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
        mockUseParams.mockReturnValue({
            id: customReportId,
        })
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        renderWithStore(<CustomReportPage />, {})

        expect(screen.getByText(/Loading/i))
    })

    it('should render error on incorrect schema', () => {
        mockUseParams.mockReturnValue({
            id: customReportId,
        })
        useGetAnalyticsCustomReportMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as any)

        renderWithStore(<CustomReportPage />, {})

        expect(screen.getByText(CUSTOM_REPORT_SCHEMA_ERROR))
    })
})
