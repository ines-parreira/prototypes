import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { DownloadTicketFieldsDataButton } from 'domains/reporting/pages/ticket-insights/ticket-fields/DownloadTicketFieldsDataButton'
import { useCustomFieldsReportData } from 'domains/reporting/services/ticketFieldsReportingService'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/services/ticketFieldsReportingService')
const useCustomFieldsReportDataMock = assumeMock(useCustomFieldsReportData)

const downloadMock = jest.fn()

describe('DownloadTicketFieldsDataButton', () => {
    const selectedCustomFieldId = 2

    beforeEach(() => {
        useCustomFieldsReportDataMock.mockReturnValue({
            download: downloadMock,
            isLoading: false,
        })
    })

    it('should render', () => {
        render(
            <DownloadTicketFieldsDataButton
                selectedCustomFieldId={selectedCustomFieldId}
            />,
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should be disabled', () => {
        useCustomFieldsReportDataMock.mockReturnValue({
            download: downloadMock,
            isLoading: true,
        })

        render(
            <DownloadTicketFieldsDataButton
                selectedCustomFieldId={selectedCustomFieldId}
            />,
        )

        expect(screen.getByRole('button')).toBeAriaDisabled()
    })

    it('should call download on click', () => {
        render(
            <DownloadTicketFieldsDataButton
                selectedCustomFieldId={selectedCustomFieldId}
            />,
        )

        fireEvent.click(screen.getByRole('button'))

        expect(downloadMock).toHaveBeenCalled()
    })
})
