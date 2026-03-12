import React from 'react'

import { render, screen } from '@testing-library/react'

import { KnowledgeResourceLine } from 'pages/aiAgent/Onboarding_V2/components/steps/KnowledgeStep/KnowledgeResourceLine'
import { KnowledgeSourceType } from 'pages/aiAgent/Onboarding_V2/components/steps/types'

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
            screen.getByRole('img', { name: 'app-shopify' }),
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
        expect(screen.getByText('Syncing')).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: 'comm-chat-circle' }),
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
            screen.getByRole('img', { name: 'nav-globe' }),
        ).toBeInTheDocument()
    })

    it('shows syncing status when not ready', () => {
        render(
            <KnowledgeResourceLine
                name="Resource Name"
                type={KnowledgeSourceType.OTHER}
                isReady={false}
            />,
        )

        expect(screen.getByText('Syncing')).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: 'arrows-reload-alt-1' }),
        ).toBeInTheDocument()
    })
})
