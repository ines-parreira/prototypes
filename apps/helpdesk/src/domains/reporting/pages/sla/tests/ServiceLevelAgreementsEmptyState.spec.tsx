import { screen } from '@testing-library/react'

import {
    CONTENT_BODY_TEXT_PARAGRAPH_1,
    CONTENT_BODY_TEXT_PARAGRAPH_2,
    CONTENT_HEADER_TEXT,
    CONTENT_SET_UP_BUTTON_TEXT,
    NO_BANNER_ALT_TEXT,
    SERVICE_LEVEL_AGREEMENTS_SETTINGS_PATH,
    ServiceLevelAgreementsEmptyState,
} from 'domains/reporting/pages/sla/ServiceLevelAgreementsEmptyState'
import { renderWithRouter } from 'utils/testing'

describe('ServiceLevelAgreementsEmptyState', () => {
    it('renders banner with correct alt text', () => {
        renderWithRouter(<ServiceLevelAgreementsEmptyState />)

        expect(screen.getByRole('img')).toHaveAttribute(
            'alt',
            NO_BANNER_ALT_TEXT,
        )
    })

    it('renders correct text content', () => {
        renderWithRouter(<ServiceLevelAgreementsEmptyState />)

        expect(screen.getByText(CONTENT_HEADER_TEXT)).toBeInTheDocument()
        expect(
            screen.getByText(CONTENT_BODY_TEXT_PARAGRAPH_1),
        ).toBeInTheDocument()
        expect(
            screen.getByText(CONTENT_BODY_TEXT_PARAGRAPH_2),
        ).toBeInTheDocument()
    })

    it('renders link to SLA settings page with correct text and href', () => {
        renderWithRouter(<ServiceLevelAgreementsEmptyState />)
        const linkButton = screen.getByRole('button', {
            name: CONTENT_SET_UP_BUTTON_TEXT,
        })
        const linkElement = linkButton.parentElement

        expect(linkButton).toBeInTheDocument()
        expect(linkElement).toHaveAttribute(
            'href',
            SERVICE_LEVEL_AGREEMENTS_SETTINGS_PATH,
        )
    })
})
