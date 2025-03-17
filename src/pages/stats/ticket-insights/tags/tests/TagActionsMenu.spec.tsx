import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import {
    TAG_ACTIONS_DOWNLOAD_OPTION_LABEL,
    TAG_ACTIONS_TRIGGER_LABEL,
    TagActionsMenu,
} from 'pages/stats/ticket-insights/tags/TagActionsMenu'
import { useDownloadTagsReportData } from 'services/reporting/tagsReportingService'
import { assumeMock } from 'utils/testing'

jest.mock('services/reporting/tagsReportingService')
const useDownloadTagsReportDataMock = assumeMock(useDownloadTagsReportData)

describe('TagActionsMenu', () => {
    const downloadMock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        useDownloadTagsReportDataMock.mockReturnValue({
            download: downloadMock,
            isLoading: false,
        })
    })

    it('renders the actions button', () => {
        render(<TagActionsMenu />)

        expect(
            screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL),
        ).toBeInTheDocument()
    })

    it('opens dropdown when clicking the button', () => {
        render(<TagActionsMenu />)

        fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))

        expect(
            screen.getByText(TAG_ACTIONS_DOWNLOAD_OPTION_LABEL),
        ).toBeInTheDocument()
    })

    it('triggers download when clicking the download option', () => {
        render(<TagActionsMenu />)

        fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))
        fireEvent.click(screen.getByText(TAG_ACTIONS_DOWNLOAD_OPTION_LABEL))

        expect(downloadMock).toHaveBeenCalledTimes(1)
    })

    it('disables download option when loading', () => {
        useDownloadTagsReportDataMock.mockReturnValue({
            download: downloadMock,
            isLoading: true,
        })

        render(<TagActionsMenu />)

        fireEvent.click(screen.getByLabelText(TAG_ACTIONS_TRIGGER_LABEL))
        const downloadOption = screen.getByText(
            TAG_ACTIONS_DOWNLOAD_OPTION_LABEL,
        )

        fireEvent.click(downloadOption)
        expect(downloadMock).not.toHaveBeenCalled()
    })
})
