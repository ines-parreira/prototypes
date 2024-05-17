import React from 'react'
import {render, screen} from '@testing-library/react'
import {
    ServiceLevelAgreementsEmptyState,
    NO_BANNER_ALT_TEXT,
    SERVICE_LEVEL_AGREEMENTS_SETTINGS_PATH,
    PAGE_TITLE,
    CONTENT_HEADER_TEXT,
    CONTENT_BODY_TEXT_PARAGRAPH_1,
    CONTENT_BODY_TEXT_PARAGRAPH_2,
    CONTENT_SET_UP_BUTTON_TEXT,
} from 'pages/stats/sla/ServiceLevelAgreementsEmptyState'

describe('ServiceLevelAgreementsEmptyState', () => {
    it('renders page header title', () => {
        render(<ServiceLevelAgreementsEmptyState />)

        expect(
            screen.getByRole('heading', {name: PAGE_TITLE})
        ).toBeInTheDocument()
    })

    it('renders banner with correct alt text', () => {
        render(<ServiceLevelAgreementsEmptyState />)

        expect(screen.getByRole('img')).toHaveAttribute(
            'alt',
            NO_BANNER_ALT_TEXT
        )
    })

    it('renders correct text content', () => {
        render(<ServiceLevelAgreementsEmptyState />)

        expect(screen.getByText(CONTENT_HEADER_TEXT)).toBeInTheDocument()
        expect(
            screen.getByText(CONTENT_BODY_TEXT_PARAGRAPH_1)
        ).toBeInTheDocument()
        expect(
            screen.getByText(CONTENT_BODY_TEXT_PARAGRAPH_2)
        ).toBeInTheDocument()
    })

    it('renders link to SLA settings page with correct text and href', () => {
        render(<ServiceLevelAgreementsEmptyState />)
        const linkButton = screen.getByRole('button', {
            name: CONTENT_SET_UP_BUTTON_TEXT,
        })
        const linkElement = linkButton.parentElement

        expect(linkButton).toBeInTheDocument()
        expect(linkElement).toHaveAttribute(
            'to',
            SERVICE_LEVEL_AGREEMENTS_SETTINGS_PATH
        )
        expect(linkElement).toHaveAttribute('target', '_blank')
        expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer')
    })
})
