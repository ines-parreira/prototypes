import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'

import { FeatureFlagKey } from 'config/featureFlags'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useFileIngestion } from 'pages/aiAgent/hooks/useFileIngestion'
import { usePublicResources } from 'pages/aiAgent/hooks/usePublicResources'

import { CheckPlaygroundPrerequisites } from '../PlaygroundPrerequisites'

jest.mock('pages/aiAgent/hooks/useFileIngestion', () => ({
    useFileIngestion: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/usePublicResources', () => ({
    usePublicResources: jest.fn(),
}))

const mockUseFileIngestion = useFileIngestion as jest.Mock

const mockUsePublicResources = jest.mocked(usePublicResources)

const renderComponent = (
    props?: Partial<ComponentProps<typeof CheckPlaygroundPrerequisites>>,
) => {
    return render(
        <CheckPlaygroundPrerequisites shopName="it-shop" {...props}>
            <div>Child Component</div>
        </CheckPlaygroundPrerequisites>,
    )
}

describe('CheckPlaygroundPrerequisites', () => {
    beforeEach(() => {
        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [],
            isLoading: false,
        })

        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })
    })

    it('renders MissingKnowledgeSourceAlert when storeConfiguration is not provided and snippetHelpCenterId is not provided', () => {
        renderComponent()

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Test AI Agent as a customerAt least one knowledge source is required to use test mode',
        )

        expect(screen.getByText('Add Knowledge')).toHaveAttribute(
            'to',
            '/app/automation/shopify/it-shop/ai-agent/settings?section=knowledge',
        )
    })

    it('renders MissingKnowledgeSourceAlert with the correct link when the feature flag is on', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentKnowledgeTab]: true,
        })

        renderComponent()

        expect(screen.getByText('Add Knowledge')).toHaveAttribute(
            'to',
            '/app/automation/shopify/it-shop/ai-agent/knowledge',
        )
    })

    it('renders MissingKnowledgeSourceAlert when storeConfiguration is not provided and snippetHelpCenterId is provided', () => {
        renderComponent({
            snippetHelpCenterId: 123,
        })

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Test AI Agent as a customerAt least one knowledge source is required to use test mode',
        )
    })

    it('renders children when storeConfiguration is provided and helpCenterId is not null', () => {
        renderComponent({
            storeConfiguration: getStoreConfigurationFixture({
                helpCenterId: 123,
            }),
        })

        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })

    it('renders Loader when source items are loading', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: true,
        })
        renderComponent({ snippetHelpCenterId: 123 })

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders Loader when external files are loading', () => {
        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [],
            isLoading: true,
        })

        renderComponent({ snippetHelpCenterId: 123 })

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders missing knowledge base alert when no source items and external files are present', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [{ status: 'loading', id: 0 }],
            isSourceItemsListLoading: false,
        })

        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [{ status: 'FAILED' }],
            isLoading: false,
        })

        renderComponent({ snippetHelpCenterId: 123 })

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Test AI Agent as a customerAt least one knowledge source is required to use test mode',
        )
    })

    it('renders children when at least one source item is done', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [{ status: 'done', id: 0 }],
            isSourceItemsListLoading: false,
        })
        renderComponent({ snippetHelpCenterId: 123 })

        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })

    it('renders children when at least one external file is present', () => {
        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [{ status: 'SUCCESSFUL' }],
            isLoading: false,
        })

        renderComponent({ snippetHelpCenterId: 123 })

        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })
})
