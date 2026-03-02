import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { useDownloadAgentsAvailabilityData } from 'domains/reporting/hooks/support-performance/agents/useDownloadAgentsAvailabilityData'
import { DOWNLOAD_BUTTON_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import { DownloadAgentsAvailabilityButton } from 'domains/reporting/pages/support-performance/agents/DownloadAgentsAvailabilityButton'
import { saveZippedFiles } from 'utils/file'

jest.mock(
    'domains/reporting/hooks/support-performance/agents/useDownloadAgentsAvailabilityData',
)
const useDownloadAgentsAvailabilityDataMock = assumeMock(
    useDownloadAgentsAvailabilityData,
)

jest.mock('utils/file')
const saveZippedFilesMock = assumeMock(saveZippedFiles)

describe('DownloadAgentsAvailabilityButton', () => {
    const reportData = {
        files: {
            ['agents-availability']: 'csv-data',
        },
        fileName: 'agents-availability-2021-02-03.csv',
        isLoading: false,
    }

    beforeEach(() => {
        useDownloadAgentsAvailabilityDataMock.mockReturnValue(reportData)
    })

    it('should render with correct title', () => {
        render(<DownloadAgentsAvailabilityButton />)

        const button = screen.getByRole('button', { name: /download data/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute(
            'title',
            DOWNLOAD_BUTTON_TITLES.AGENT_AVAILABILITY,
        )
    })

    it('should not be disabled by default', () => {
        render(<DownloadAgentsAvailabilityButton />)

        expect(
            screen.getByRole('button', { name: /download data/i }),
        ).not.toBeDisabled()
    })

    it('should call saveZippedFiles on click', async () => {
        const user = userEvent.setup()
        render(<DownloadAgentsAvailabilityButton />)

        await user.click(screen.getByRole('button', { name: /download data/i }))

        expect(saveZippedFilesMock).toHaveBeenCalledWith(
            reportData.files,
            reportData.fileName,
        )
    })

    it('should be disabled when loading', () => {
        useDownloadAgentsAvailabilityDataMock.mockReturnValue({
            ...reportData,
            isLoading: true,
        })

        render(<DownloadAgentsAvailabilityButton />)

        expect(
            screen.getByRole('button', { name: /download data/i }),
        ).toHaveAttribute('aria-disabled', 'true')
    })
})
