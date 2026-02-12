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
    TAG_ACTIONS_DOWNLOAD_OPTION_LABEL,
    TAGS_ALL_STATUSES_LABEL,
    TAGS_CREATION_DATE_LABEL,
    TAGS_EXCLUDE_TAGS_LABEL,
    TAGS_INCLUDE_TAGS_LABEL,
    TAGS_LABEL,
    TAGS_REFERENCE_LABEL,
    TagsActionMenu,
} from 'domains/reporting/pages/ticket-insights/tags/TagsActionMenu'
import { useDownloadTagsReportData } from 'domains/reporting/services/tagsReportingService'

jest.mock('domains/reporting/hooks/ticket-insights/useTicketTimeReference')
const useTicketTimeReferenceMock = assumeMock(useTicketTimeReference)

jest.mock('domains/reporting/services/tagsReportingService')
const useDownloadTagsReportDataMock = assumeMock(useDownloadTagsReportData)

jest.mock(
    'domains/reporting/hooks/ticket-insights/useNotifyOnTimeReferenceChange',
)
const useNotifyOnTimeReferenceChangeMock = assumeMock(
    useNotifyOnTimeReferenceChange,
)

describe('<TagsActionMenu />', () => {
    const mockSetTimeReference = jest.fn()
    const mockDownload = jest.fn()

    beforeEach(() => {
        useTicketTimeReferenceMock.mockReturnValue([
            TicketTimeReference.TaggedAt,
            mockSetTimeReference,
        ])
        useDownloadTagsReportDataMock.mockReturnValue({
            download: mockDownload,
            isLoading: false,
        })
        useNotifyOnTimeReferenceChangeMock.mockImplementation(() => {})
    })

    it('should render with default time reference', () => {
        const { getByRole } = render(<TagsActionMenu />)

        fireEvent.click(getByRole('button', { name: ACTION_MENU_LABEL }))

        expect(screen.getByText(TAGS_LABEL)).toBeInTheDocument()
        expect(screen.getByText(TAGS_INCLUDE_TAGS_LABEL)).toBeInTheDocument()
        expect(screen.getByText(TAGS_EXCLUDE_TAGS_LABEL)).toBeInTheDocument()

        expect(screen.getByText(TAGS_REFERENCE_LABEL)).toBeInTheDocument()
        expect(screen.getByText(TAGS_ALL_STATUSES_LABEL)).toBeInTheDocument()
        expect(screen.getByText(TAGS_CREATION_DATE_LABEL)).toBeInTheDocument()
    })

    it('should handle time reference change', () => {
        const { getByRole } = render(<TagsActionMenu />)

        fireEvent.click(getByRole('button', { name: ACTION_MENU_LABEL }))

        fireEvent.click(screen.getByText(TAGS_CREATION_DATE_LABEL))

        expect(mockSetTimeReference).toHaveBeenCalledWith(
            TicketTimeReference.CreatedAt,
        )
    })

    it('should notify on time reference change', () => {
        const { getByRole } = render(<TagsActionMenu />)

        fireEvent.click(getByRole('button', { name: ACTION_MENU_LABEL }))

        fireEvent.click(screen.getByText(TAGS_CREATION_DATE_LABEL))

        waitFor(() => {
            expect(useNotifyOnTimeReferenceChangeMock).toHaveBeenCalledWith(
                ReportName.Tags,
                TicketTimeReference.CreatedAt,
            )
        })
    })

    it('should handle download click', () => {
        const { getByRole } = render(<TagsActionMenu />)

        fireEvent.click(getByRole('button', { name: ACTION_MENU_LABEL }))

        fireEvent.click(screen.getByText(TAG_ACTIONS_DOWNLOAD_OPTION_LABEL))

        expect(mockDownload).toHaveBeenCalled()
    })
})
