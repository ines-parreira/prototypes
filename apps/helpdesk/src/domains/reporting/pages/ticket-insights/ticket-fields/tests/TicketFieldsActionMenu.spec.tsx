import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
    ReportName,
    useNotifyOnTimeReferenceChange,
} from 'domains/reporting/hooks/ticket-insights/useNotifyOnTimeReferenceChange'
import { useTicketTimeReference } from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import { ACTION_MENU_LABEL } from 'domains/reporting/pages/common/components/ActionMenu'
import {
    TICKET_FIELDS_ALL_STATUSES_LABEL,
    TICKET_FIELDS_CREATION_DATE_LABEL,
    TICKET_FIELDS_DOWNLOAD_OPTION_LABEL,
    TICKET_FIELDS_LABEL,
    TicketFieldsActionMenu,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketFieldsActionMenu'
import { useCustomFieldsReportData } from 'domains/reporting/services/ticketFieldsReportingService'

jest.mock('domains/reporting/hooks/ticket-insights/useTicketTimeReference')
const useTicketTimeReferenceMock = assumeMock(useTicketTimeReference)

jest.mock('domains/reporting/services/ticketFieldsReportingService')
const useCustomFieldsReportDataMock = assumeMock(useCustomFieldsReportData)

jest.mock(
    'domains/reporting/hooks/ticket-insights/useNotifyOnTimeReferenceChange',
)
const useNotifyOnTimeReferenceChangeMock = assumeMock(
    useNotifyOnTimeReferenceChange,
)

describe('<TicketFieldsActionMenu />', () => {
    const mockSetTimeReference = jest.fn()
    const mockDownload = jest.fn()

    beforeEach(() => {
        useTicketTimeReferenceMock.mockReturnValue([
            TicketTimeReference.TaggedAt,
            mockSetTimeReference,
        ])
        useCustomFieldsReportDataMock.mockReturnValue({
            download: mockDownload,
            isLoading: false,
        })
        useNotifyOnTimeReferenceChangeMock.mockImplementation(() => {})
    })

    it('should render with default time reference', () => {
        const { getByRole } = render(
            <TicketFieldsActionMenu ticketFieldId={123} />,
        )

        fireEvent.click(getByRole('button', { name: ACTION_MENU_LABEL }))

        expect(screen.getByText(TICKET_FIELDS_LABEL)).toBeInTheDocument()
        expect(
            screen.getByText(TICKET_FIELDS_ALL_STATUSES_LABEL),
        ).toBeInTheDocument()
        expect(
            screen.getByText(TICKET_FIELDS_CREATION_DATE_LABEL),
        ).toBeInTheDocument()
    })

    it('should handle time reference change', () => {
        const { getByRole } = render(
            <TicketFieldsActionMenu ticketFieldId={123} />,
        )

        fireEvent.click(getByRole('button', { name: ACTION_MENU_LABEL }))

        fireEvent.click(screen.getByText(TICKET_FIELDS_CREATION_DATE_LABEL))

        expect(mockSetTimeReference).toHaveBeenCalledWith(
            TicketTimeReference.CreatedAt,
        )
    })

    it('should notify on time reference change', () => {
        const { getByRole } = render(
            <TicketFieldsActionMenu ticketFieldId={123} />,
        )

        fireEvent.click(getByRole('button', { name: ACTION_MENU_LABEL }))

        fireEvent.click(screen.getByText(TICKET_FIELDS_CREATION_DATE_LABEL))

        waitFor(() => {
            expect(useNotifyOnTimeReferenceChangeMock).toHaveBeenCalledWith(
                ReportName.TicketFields,
                TicketTimeReference.CreatedAt,
            )
        })
    })

    it('should handle download click', () => {
        const { getByRole } = render(
            <TicketFieldsActionMenu ticketFieldId={123} />,
        )

        fireEvent.click(getByRole('button', { name: ACTION_MENU_LABEL }))

        fireEvent.click(screen.getByText(TICKET_FIELDS_DOWNLOAD_OPTION_LABEL))

        expect(mockDownload).toHaveBeenCalled()
    })
})
