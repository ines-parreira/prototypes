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
import {
    CustomReportChildType,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'

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
const mockSetOpenModal = jest.fn()

jest.mock('hooks/reporting/custom-reports/useCustomReportActions', () => ({
    useCustomReportActions: () => ({
        duplicateReportHandler: mockDuplicateReport,
        deleteReportHandler: mockDeleteReport,
    }),
}))

describe('CustomReportActionButton', () => {
    const customReport: CustomReportSchema = {
        id: 1,
        name: 'Test Report',
        analytics_filter_id: 123,
        children: [
            {
                config_id: '',
                type: CustomReportChildType.Chart,
            },
        ],
        emoji: '',
    }

    it('should check that all actions are present in the actions dropdown', async () => {
        render(
            <CustomReportActionButton
                customReport={customReport}
                setOpenModal={mockSetOpenModal}
            />
        )

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

        userEvent.click(screen.getByText(ADD_OR_REMOVE_REPORT_LABEL))
        expect(mockSetOpenModal).toHaveBeenCalledWith(true)
    })

    it('should call delete mutation on delete action', async () => {
        render(
            <CustomReportActionButton
                customReport={customReport}
                setOpenModal={mockSetOpenModal}
            />
        )

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

    it('should not call delete mutation on confirmation modal cancel', async () => {
        render(
            <CustomReportActionButton
                customReport={customReport}
                setOpenModal={mockSetOpenModal}
            />
        )

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
