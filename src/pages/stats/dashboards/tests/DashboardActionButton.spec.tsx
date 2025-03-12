import React from 'react'

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useDownloadDashboardData } from 'hooks/reporting/dashboards/useDownloadDashboardData'
import {
    DASHBOARD_ID_CTA,
    DashboardActionButton,
} from 'pages/stats/dashboards/DashboardActionButton'
import {
    ADD_OR_REMOVE_REPORT_LABEL,
    CANCEL_CONFIRMATION_BUTTON_LABEL,
    DELETE_CONFIRMATION_BUTTON_LABEL,
    DELETE_REPORT_LABEL,
    DOWNLOAD_REPORT_LABEL,
    getDeleteConfirmationTitle,
} from 'pages/stats/dashboards/DashboardsPageActions'
import {
    DashboardChildType,
    DashboardSchema,
} from 'pages/stats/dashboards/types'
import { assumeMock } from 'utils/testing'

const mockPush = jest.fn()
const baseURL = '/some/path'
const liveOverviewURL = `${baseURL}/live-overview`

jest.mock('react-router-dom', () => ({
    useLocation: jest
        .fn()
        .mockReturnValue({ pathname: `${baseURL}/dashboards` }),
    useHistory: () => ({
        push: mockPush,
    }),
}))

const mockDuplicateReport = jest.fn()
const mockSetOpenModal = jest.fn()

jest.mock('hooks/reporting/dashboards/useDashboardActions', () => ({
    useDashboardActions: () => ({
        duplicateReportHandler: mockDuplicateReport,
        deleteReportHandler: ({ onSuccess }: { onSuccess: () => void }) => {
            onSuccess()
        },
    }),
}))
jest.mock('hooks/reporting/dashboards/useDownloadDashboardData')
const useDownloadDashboardDataMock = assumeMock(useDownloadDashboardData)

describe('DashboardActionButton', () => {
    const dashboard: DashboardSchema = {
        id: 1,
        name: 'Test Report',
        analytics_filter_id: 123,
        children: [
            {
                config_id: '',
                type: DashboardChildType.Chart,
            },
        ],
        emoji: '',
    }

    beforeEach(() => {
        useDownloadDashboardDataMock.mockReturnValue({
            isLoading: false,
            triggerDownload: jest.fn(),
        })
    })

    it('should check that all actions are present in the actions dropdown', async () => {
        render(
            <DashboardActionButton
                dashboard={dashboard}
                setOpenModal={mockSetOpenModal}
            />,
        )

        userEvent.click(screen.getByRole('button', { name: DASHBOARD_ID_CTA }))

        await waitFor(() => {
            expect(screen.getByText(DOWNLOAD_REPORT_LABEL)).toBeInTheDocument()
            expect(screen.getByText(DELETE_REPORT_LABEL)).toBeInTheDocument()
            expect(
                screen.getByText(ADD_OR_REMOVE_REPORT_LABEL),
            ).toBeInTheDocument()
        })

        userEvent.click(screen.getByText(ADD_OR_REMOVE_REPORT_LABEL))
        expect(mockSetOpenModal).toHaveBeenCalledWith(true)
    })

    it('should call delete mutation on delete action', async () => {
        render(
            <DashboardActionButton
                dashboard={dashboard}
                setOpenModal={mockSetOpenModal}
            />,
        )

        userEvent.click(screen.getByRole('button', { name: DASHBOARD_ID_CTA }))

        await waitFor(() => {
            userEvent.click(screen.getByText(DELETE_REPORT_LABEL))
        })

        const confirmationModal = screen.getByRole('dialog')
        expect(confirmationModal).toBeInTheDocument()
        expect(
            within(confirmationModal).getByText(
                getDeleteConfirmationTitle(dashboard.name),
            ),
        ).toBeInTheDocument()
        userEvent.click(
            within(confirmationModal).getByText(
                DELETE_CONFIRMATION_BUTTON_LABEL,
            ),
        )

        expect(mockPush).toHaveBeenCalledWith(liveOverviewURL)
    })

    it('should not call delete mutation if dashboard is undefined', async () => {
        render(
            <DashboardActionButton
                dashboard={undefined}
                setOpenModal={mockSetOpenModal}
            />,
        )

        userEvent.click(screen.getByRole('button', { name: DASHBOARD_ID_CTA }))

        await waitFor(() => {
            userEvent.click(screen.getByText(DELETE_REPORT_LABEL))
        })

        expect(mockPush).not.toHaveBeenCalled()
    })

    it('should not call delete mutation on confirmation modal cancel', async () => {
        render(
            <DashboardActionButton
                dashboard={dashboard}
                setOpenModal={mockSetOpenModal}
            />,
        )

        userEvent.click(screen.getByRole('button', { name: DASHBOARD_ID_CTA }))

        await waitFor(() => {
            userEvent.click(screen.getByText(DELETE_REPORT_LABEL))
        })

        const confirmationModal = screen.getByRole('dialog')
        expect(confirmationModal).toBeInTheDocument()
        expect(
            within(confirmationModal).getByText(
                getDeleteConfirmationTitle(dashboard.name),
            ),
        ).toBeInTheDocument()
        userEvent.click(
            within(confirmationModal).getByText(
                CANCEL_CONFIRMATION_BUTTON_LABEL,
            ),
        )

        expect(mockPush).not.toHaveBeenCalled()
    })
})
