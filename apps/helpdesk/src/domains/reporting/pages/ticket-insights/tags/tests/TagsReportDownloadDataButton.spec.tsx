import React from 'react'

import { fireEvent, screen } from '@testing-library/react'

import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/constants'
import { TagsReportDownloadDataButton } from 'domains/reporting/pages/ticket-insights/tags/TagsReportDownloadDataButton'
import { useDownloadTagsReportData } from 'domains/reporting/services/tagsReportingService'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/services/tagsReportingService')
const useDownloadTagsReportDataMock = assumeMock(useDownloadTagsReportData)

const getDownloadButton = () =>
    screen.getByRole('button', {
        name: new RegExp(DOWNLOAD_DATA_BUTTON_LABEL),
    })

describe('<TagsReportDownloadDataButton />', () => {
    const downloadMock = jest.fn()

    beforeEach(() => {
        useDownloadTagsReportDataMock.mockReturnValue({
            download: downloadMock,
            isLoading: false,
        })
    })

    it('should render the Button', () => {
        renderWithStore(<TagsReportDownloadDataButton />, {})

        expect(getDownloadButton()).toBeInTheDocument()
    })

    it('should call `download` on click', () => {
        renderWithStore(<TagsReportDownloadDataButton />, {})

        fireEvent.click(getDownloadButton())

        expect(downloadMock).toHaveBeenCalled()
    })

    it('should disable button when loading', () => {
        useDownloadTagsReportDataMock.mockReturnValue({
            download: downloadMock,
            isLoading: true,
        })

        renderWithStore(<TagsReportDownloadDataButton />, {})

        expect(getDownloadButton()).toHaveAttribute('aria-disabled', 'true')
    })
})
