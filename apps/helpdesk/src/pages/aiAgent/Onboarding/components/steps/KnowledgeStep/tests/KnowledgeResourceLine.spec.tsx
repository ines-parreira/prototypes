import React from 'react'

import { render, screen } from '@testing-library/react'

import { KnowledgeResourceLine } from 'pages/aiAgent/Onboarding/components/steps/KnowledgeStep/KnowledgeResourceLine'
import { KnowledgeSourceType } from 'pages/aiAgent/Onboarding/components/steps/types'

describe('KnowledgeResourceLine', () => {
    it('renders Shopify resource with ready status', () => {
        render(
            <KnowledgeResourceLine
                name="My Shopify Store"
                type={KnowledgeSourceType.SHOPIFY}
                isReady={true}
            />,
        )

        expect(screen.getByText('My Shopify Store')).toBeInTheDocument()
        expect(screen.getByText('Ready')).toBeInTheDocument()
        expect(
            screen.getByText('', { selector: '#store-icon' }),
        ).toBeInTheDocument()
    })

    it('renders Help Center resource with in process status', () => {
        render(
            <KnowledgeResourceLine
                name="Help Center Articles"
                type={KnowledgeSourceType.HELP_CENTER}
                isReady={false}
            />,
        )

        expect(screen.getByText('Help Center Articles')).toBeInTheDocument()
        expect(screen.getByText('In Process')).toBeInTheDocument()
        expect(
            screen.getByText('', { selector: '#chat-icon' }),
        ).toBeInTheDocument()
    })

    it('renders URL resource with ready status', () => {
        render(
            <KnowledgeResourceLine
                name="https://example.com"
                type={KnowledgeSourceType.OTHER}
                isReady={true}
            />,
        )

        expect(screen.getByText('https://example.com')).toBeInTheDocument()
        expect(screen.getByText('Ready')).toBeInTheDocument()
        expect(
            screen.getByText('', { selector: '#link-icon' }),
        ).toBeInTheDocument()
    })

    it('shows loading spinner when not ready', () => {
        render(
            <KnowledgeResourceLine
                name="Resource Name"
                type={KnowledgeSourceType.OTHER}
                isReady={false}
            />,
        )

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
        expect(screen.getByText('In Process')).toBeInTheDocument()
    })
})
