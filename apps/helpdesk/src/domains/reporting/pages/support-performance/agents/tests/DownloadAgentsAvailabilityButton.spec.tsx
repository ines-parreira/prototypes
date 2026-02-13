import React from 'react'

import { render, screen } from '@testing-library/react'

import { DOWNLOAD_BUTTON_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import { DownloadAgentsAvailabilityButton } from 'domains/reporting/pages/support-performance/agents/DownloadAgentsAvailabilityButton'

jest.mock(
    'domains/reporting/pages/support-performance/components/DownloadDataButton',
    () => ({
        DownloadDataButton: ({
            title,
            disabled,
        }: {
            title: string
            disabled: boolean
        }) => (
            <button disabled={disabled} type="button">
                {title}
            </button>
        ),
    }),
)

describe('DownloadAgentsAvailabilityButton', () => {
    it('should render with correct title', () => {
        render(<DownloadAgentsAvailabilityButton />)

        expect(
            screen.getByRole('button', {
                name: DOWNLOAD_BUTTON_TITLES.AGENT_AVAILABILITY,
            }),
        ).toBeInTheDocument()
    })

    it('should not be disabled by default', () => {
        render(<DownloadAgentsAvailabilityButton />)

        expect(
            screen.getByRole('button', {
                name: DOWNLOAD_BUTTON_TITLES.AGENT_AVAILABILITY,
            }),
        ).not.toBeDisabled()
    })
})
