import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { OpportunityResource } from '../../types'
import { ResourceType } from '../../types'
import { OpportunitySnippetEditor } from './OpportunitySnippetEditor'

jest.mock('react-router', () => ({
    useHistory: jest.fn(),
}))

const mockUseShouldDisplayExecutionId = jest.fn()
jest.mock('pages/aiAgent/hooks/useShouldDisplayExecutionId', () => ({
    useShouldDisplayExecutionId: () => mockUseShouldDisplayExecutionId(),
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
    identifiers: {
        resourceId: '31407',
        resourceSetId: 'set-123',
        resourceLocale: 'en',
        resourceVersion: '1.0',
    },
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
        mockUseShouldDisplayExecutionId.mockReturnValue(false)
        mockUseHistory.mockReturnValue({ push: mockPush })
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                knowledge: '/app/ai-agent/shopify/test-shop/knowledge',
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
            '/app/ai-agent/shopify/test-shop/knowledge/url/31407?filter=url&folder=https%3A%2F%2Furl.com',
        )
    })

    it('should navigate to knowledge sources with document filter when clicking source with file type', async () => {
        const user = userEvent.setup()

        const fileResource: OpportunityResource = {
            ...mockResource,
            identifiers: {
                resourceId: '31237',
                resourceSetId: 'set-456',
                resourceLocale: 'en',
                resourceVersion: '1.0',
            },
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
            '/app/ai-agent/shopify/test-shop/knowledge/document/31237?filter=document&folder=document.pdf',
        )
    })

    it('should navigate to knowledge sources with domain filter when clicking source with domain type', async () => {
        const user = userEvent.setup()

        const domainResource: OpportunityResource = {
            ...mockResource,
            identifiers: {
                resourceId: '31437',
                resourceSetId: 'set-789',
                resourceLocale: 'en',
                resourceVersion: '1.0',
            },
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
            '/app/ai-agent/shopify/test-shop/knowledge/domain/31437?filter=domain&folder=example.com',
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

    it('should not navigate when resourceId is missing', async () => {
        const user = userEvent.setup()

        const resourceWithoutId: OpportunityResource = {
            ...mockResource,
            identifiers: undefined,
        }

        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                resource={resourceWithoutId}
            />,
        )

        const sourceElement = screen.getByText('https://url.com')
        await user.click(sourceElement)

        expect(mockPush).not.toHaveBeenCalled()
    })

    it('should render execution ID when impersonated', () => {
        mockUseShouldDisplayExecutionId.mockReturnValue(true)

        const resourceWithExecutionId: OpportunityResource = {
            ...mockResource,
            meta: {
                ...mockResource.meta,
                articleIngestionLog: mockResource.meta?.articleIngestionLog ?? {
                    source: 'url',
                    source_name: 'https://url.com',
                },
                executionId: 'exec-test-456',
            },
        }

        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                resource={resourceWithExecutionId}
            />,
        )

        expect(
            screen.getByText('Execution ID: exec-test-456'),
        ).toBeInTheDocument()
    })

    it('should not render execution ID when not impersonated', () => {
        const resourceWithExecutionId: OpportunityResource = {
            ...mockResource,
            meta: {
                ...mockResource.meta,
                articleIngestionLog: mockResource.meta?.articleIngestionLog ?? {
                    source: 'url',
                    source_name: 'https://url.com',
                },
                executionId: 'exec-test-456',
            },
        }

        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                resource={resourceWithExecutionId}
            />,
        )

        expect(
            screen.queryByText('Execution ID: exec-test-456'),
        ).not.toBeInTheDocument()
    })
})
