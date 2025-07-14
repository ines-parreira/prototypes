import React from 'react'

import { render, screen } from '@testing-library/react'

import {
    CONTENT_BODY_TEXT_PARAGRAPH_1,
    CONTENT_BODY_TEXT_PARAGRAPH_2,
    CONTENT_HEADER_TEXT,
    CONTENT_SET_UP_BUTTON_TEXT,
    NO_BANNER_ALT_TEXT,
    PAGE_TITLE,
    SERVICE_LEVEL_AGREEMENTS_SETTINGS_PATH,
    ServiceLevelAgreementsEmptyState,
} from 'domains/reporting/pages/sla/ServiceLevelAgreementsEmptyState'

describe('ServiceLevelAgreementsEmptyState', () => {
    it('renders page header title', () => {
        render(<ServiceLevelAgreementsEmptyState />)

        expect(
            screen.getByRole('heading', { name: PAGE_TITLE }),
        ).toBeInTheDocument()
    })

    it('renders banner with correct alt text', () => {
        render(<ServiceLevelAgreementsEmptyState />)

        expect(screen.getByRole('img')).toHaveAttribute(
            'alt',
            NO_BANNER_ALT_TEXT,
        )
    })

    it('renders correct text content', () => {
        render(<ServiceLevelAgreementsEmptyState />)

        expect(screen.getByText(CONTENT_HEADER_TEXT)).toBeInTheDocument()
        expect(
            screen.getByText(CONTENT_BODY_TEXT_PARAGRAPH_1),
        ).toBeInTheDocument()
        expect(
            screen.getByText(CONTENT_BODY_TEXT_PARAGRAPH_2),
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
            SERVICE_LEVEL_AGREEMENTS_SETTINGS_PATH,
        )
    })
})
