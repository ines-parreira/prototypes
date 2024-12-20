import {
    AnalyticsCustomReport,
    AnalyticsCustomReportType,
} from '@gorgias/api-queries'
import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {
    CUSTOM_REPORT_ID_CTA,
    CustomReportActionButton,
} from 'pages/stats/custom-reports/CustomReportActionButton'
import {
    CANCEL_CONFIRMATION_BUTTON_LABEL,
    DELETE_CONFIRMATION_BUTTON_LABEL,
    DELETE_REPORT_LABEL,
    DOWNLOAD_REPORT_LABEL,
    ADD_OR_REMOVE_REPORT_LABEL,
    getDeleteConfirmationTitle,
} from 'pages/stats/custom-reports/CustomReportsPageActions'

const mockPush = jest.fn()
const baseURL = '/some/path'
const liveOverviewURL = `${baseURL}/live-overview`

jest.mock('react-router-dom', () => ({
    useLocation: jest
        .fn()
        .mockReturnValue({pathname: `${baseURL}/custom-reports`}),
    useHistory: () => ({
        push: mockPush,
    }),
}))

const mockDuplicateReport = jest.fn()
const mockDeleteReport = jest.fn()

jest.mock('hooks/reporting/custom-reports/useCustomReportActions', () => ({
    useCustomReportActions: () => ({
        duplicateReportHandler: mockDuplicateReport,
        deleteReportHandler: mockDeleteReport,
    }),
}))

describe('CustomReportActionButton', () => {
    const customReport: AnalyticsCustomReport = {
        id: 1,
        name: 'Test Report',
        type: 'CUSTOM' as AnalyticsCustomReportType,
        analytics_filter_id: 123,
        account_id: 1,
        created_by: 1,
        updated_by: 1,
        created_datetime: '2023-01-01T00:00:00Z',
        updated_datetime: '2023-01-01T00:00:00Z',
        children: [],
    }

    it('should check that all actions are present in the actions dropdown', async () => {
        render(<CustomReportActionButton customReport={customReport} />)

        userEvent.click(
            screen.getByRole('button', {name: CUSTOM_REPORT_ID_CTA})
        )

        await waitFor(() => {
            expect(screen.getByText(DOWNLOAD_REPORT_LABEL)).toBeInTheDocument()
            expect(screen.getByText(DELETE_REPORT_LABEL)).toBeInTheDocument()
            expect(
                screen.getByText(ADD_OR_REMOVE_REPORT_LABEL)
            ).toBeInTheDocument()
        })
    })

    it('should call delete mutation on delete action', async () => {
        render(<CustomReportActionButton customReport={customReport} />)

        userEvent.click(
            screen.getByRole('button', {name: CUSTOM_REPORT_ID_CTA})
        )

        await waitFor(() => {
            userEvent.click(screen.getByText(DELETE_REPORT_LABEL))
        })

        const confirmationModal = screen.getByRole('dialog')
        expect(confirmationModal).toBeInTheDocument()
        expect(
            within(confirmationModal).getByText(
                getDeleteConfirmationTitle(customReport.name)
            )
        ).toBeInTheDocument()
        userEvent.click(
            within(confirmationModal).getByText(
                DELETE_CONFIRMATION_BUTTON_LABEL
            )
        )

        expect(mockDeleteReport).toHaveBeenCalled()

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(liveOverviewURL)
        })
    })

    it('should not call delete mutation on delete action when there is no custom report', async () => {
        render(<CustomReportActionButton customReport={undefined} />)

        userEvent.click(
            screen.getByRole('button', {name: CUSTOM_REPORT_ID_CTA})
        )

        await waitFor(() => {
            userEvent.click(screen.getByText(DELETE_REPORT_LABEL))
        })

        const confirmationModal = screen.getByRole('dialog')
        expect(confirmationModal).toBeInTheDocument()
        expect(
            within(confirmationModal).getByText(getDeleteConfirmationTitle(''))
        ).toBeInTheDocument()
        userEvent.click(
            within(confirmationModal).getByText(
                DELETE_CONFIRMATION_BUTTON_LABEL
            )
        )

        expect(mockDeleteReport).not.toHaveBeenCalled()
    })

    it('should not call delete mutation on confirmation modal cancel', async () => {
        render(<CustomReportActionButton customReport={customReport} />)

        userEvent.click(
            screen.getByRole('button', {name: CUSTOM_REPORT_ID_CTA})
        )

        await waitFor(() => {
            userEvent.click(screen.getByText(DELETE_REPORT_LABEL))
        })

        const confirmationModal = screen.getByRole('dialog')
        expect(confirmationModal).toBeInTheDocument()
        expect(
            within(confirmationModal).getByText(
                getDeleteConfirmationTitle(customReport.name)
            )
        ).toBeInTheDocument()
        userEvent.click(
            within(confirmationModal).getByText(
                CANCEL_CONFIRMATION_BUTTON_LABEL
            )
        )

        expect(mockDeleteReport).not.toHaveBeenCalled()
    })
})
