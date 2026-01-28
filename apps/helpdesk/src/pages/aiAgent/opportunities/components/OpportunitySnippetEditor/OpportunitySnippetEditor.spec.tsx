import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { OpportunityResource } from '../../types'
import { ResourceType } from '../../types'
import { OpportunitySnippetEditor } from './OpportunitySnippetEditor'

jest.mock('react-router', () => ({
    useHistory: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(),
}))

const mockPush = jest.fn()
const mockUseHistory = require('react-router').useHistory as jest.Mock
const mockUseAiAgentNavigation =
    require('pages/aiAgent/hooks/useAiAgentNavigation')
        .useAiAgentNavigation as jest.Mock

const mockResource: OpportunityResource = {
    title: 'Test Snippet',
    content: 'Test snippet content',
    type: ResourceType.EXTERNAL_SNIPPET,
    isVisible: true,
    meta: {
        articleIngestionLog: {
            source: 'url',
            source_name: 'https://url.com',
        },
    },
}

describe('OpportunitySnippetEditor', () => {
    const defaultProps = {
        resource: mockResource,
        shopName: 'test-shop',
    }

    beforeEach(() => {
        mockUseHistory.mockReturnValue({ push: mockPush })
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                knowledgeSources:
                    '/app/ai-agent/shopify/test-shop/knowledge/sources',
            },
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render snippet content', () => {
        render(<OpportunitySnippetEditor {...defaultProps} />)

        expect(screen.getByText('Test snippet content')).toBeInTheDocument()
    })

    it('should render enable button when visible', () => {
        render(<OpportunitySnippetEditor {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /disable/i }),
        ).toBeInTheDocument()
    })

    it('should render disable button when not visible', () => {
        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                resource={{ ...mockResource, isVisible: false }}
            />,
        )

        expect(
            screen.getByRole('button', { name: /enable/i }),
        ).toBeInTheDocument()
    })

    it('should call onValuesChange when toggling visibility', async () => {
        const user = userEvent.setup()
        const onValuesChange = jest.fn()

        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                onValuesChange={onValuesChange}
            />,
        )

        const disableButton = screen.getByRole('button', { name: /disable/i })
        await user.click(disableButton)

        expect(onValuesChange).toHaveBeenCalledWith({
            title: 'Test Snippet',
            content: 'Test snippet content',
            isVisible: false,
        })
    })

    it('should toggle from disabled to enabled', async () => {
        const user = userEvent.setup()
        const onValuesChange = jest.fn()

        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                resource={{ ...mockResource, isVisible: false }}
                onValuesChange={onValuesChange}
            />,
        )

        const enableButton = screen.getByRole('button', { name: /enable/i })
        await user.click(enableButton)

        expect(onValuesChange).toHaveBeenCalledWith({
            title: 'Test Snippet',
            content: 'Test snippet content',
            isVisible: true,
        })
    })

    it('should render source information', () => {
        render(<OpportunitySnippetEditor {...defaultProps} />)

        expect(screen.getByText('https://url.com')).toBeInTheDocument()
    })

    it('should navigate to knowledge sources with url filter when clicking source with url type', async () => {
        const user = userEvent.setup()

        render(<OpportunitySnippetEditor {...defaultProps} />)

        const sourceElement = screen.getByText('https://url.com')
        await user.click(sourceElement)

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/knowledge/sources?filter=url',
        )
    })

    it('should navigate to knowledge sources with document filter when clicking source with file type', async () => {
        const user = userEvent.setup()

        const fileResource: OpportunityResource = {
            ...mockResource,
            meta: {
                articleIngestionLog: {
                    source: 'file',
                    source_name: 'document.pdf',
                },
            },
        }

        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                resource={fileResource}
            />,
        )

        const sourceElement = screen.getByText('document.pdf')
        await user.click(sourceElement)

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/knowledge/sources?filter=document',
        )
    })

    it('should navigate to knowledge sources with domain filter when clicking source with domain type', async () => {
        const user = userEvent.setup()

        const domainResource: OpportunityResource = {
            ...mockResource,
            meta: {
                articleIngestionLog: {
                    source: 'domain',
                    source_name: 'example.com',
                },
            },
        }

        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                resource={domainResource}
            />,
        )

        const sourceElement = screen.getByText('example.com')
        await user.click(sourceElement)

        expect(mockPush).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/knowledge/sources?filter=domain',
        )
    })

    it('should not render source information when not available', () => {
        const resourceWithoutSource: OpportunityResource = {
            ...mockResource,
            meta: undefined,
        }

        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                resource={resourceWithoutSource}
            />,
        )

        expect(screen.queryByText('https://url.com')).not.toBeInTheDocument()
    })
})
