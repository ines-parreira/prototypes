import type { ComponentProps } from 'react'

import { screen } from '@testing-library/react'

import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useFileIngestion } from 'pages/aiAgent/hooks/useFileIngestion'
import { usePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import { renderWithRouter } from 'utils/testing'

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
    return renderWithRouter(
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
            'At least one knowledge source is required to use test mode.Add Knowledge',
        )

        expect(screen.getByText('Add Knowledge')).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/it-shop/knowledge',
        )
    })

    it('renders MissingKnowledgeSourceAlert when storeConfiguration is not provided and snippetHelpCenterId is provided', () => {
        renderComponent({
            snippetHelpCenterId: 123,
        })

        expect(screen.getByRole('alert')).toHaveTextContent(
            'At least one knowledge source is required to use test mode.Add Knowledge',
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

    it('renders children when help center exists even if external sources are syncing', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [
                {
                    status: 'loading',
                    id: 0,
                    source: 'url',
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isSourceItemsListLoading: false,
        })

        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [
                {
                    id: 1,
                    help_center_id: 123,
                    snippets_article_ids: [],
                    filename: 'test.pdf',
                    google_storage_url: 'https://example.com/test.pdf',
                    status: 'PENDING' as const,
                    uploaded_datetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isLoading: false,
        })

        renderComponent({
            storeConfiguration: getStoreConfigurationFixture({
                helpCenterId: 456,
            }),
        })

        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })

    it('renders children when guidance articles exist even if external sources are syncing', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [
                {
                    status: 'loading',
                    id: 0,
                    source: 'url',
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isSourceItemsListLoading: false,
        })

        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [],
            isLoading: false,
        })

        renderComponent({
            storeConfiguration: getStoreConfigurationFixture({
                helpCenterId: null,
            }),
            guidanceArticlesLength: 5,
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

    it('renders MissingKnowledgeSourceAlert when sources are only syncing (no available sources)', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [
                {
                    status: 'loading',
                    id: 0,
                    source: 'url',
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isSourceItemsListLoading: false,
        })

        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [
                {
                    id: 1,
                    help_center_id: 123,
                    snippets_article_ids: [],
                    filename: 'test.pdf',
                    google_storage_url: 'https://example.com/test.pdf',
                    status: 'PENDING' as const,
                    uploaded_datetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isLoading: false,
        })

        renderComponent({ snippetHelpCenterId: 123 })

        expect(screen.getByRole('alert')).toHaveTextContent(
            'At least one knowledge source is required to use test mode.Add Knowledge',
        )
    })

    it('renders missing knowledge base alert when all sources are failed with none loading', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [
                {
                    status: 'error',
                    id: 0,
                    source: 'url',
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isSourceItemsListLoading: false,
        })

        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [
                {
                    id: 1,
                    help_center_id: 123,
                    snippets_article_ids: [],
                    filename: 'test.pdf',
                    google_storage_url: 'https://example.com/test.pdf',
                    status: 'FAILED' as const,
                    uploaded_datetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isLoading: false,
        })

        renderComponent({ snippetHelpCenterId: 123 })

        expect(screen.getByRole('alert')).toHaveTextContent(
            'At least one knowledge source is required to use test mode.Add Knowledge',
        )
    })

    it('renders children when at least one source item is done', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [
                {
                    status: 'done',
                    id: 0,
                    source: 'url',
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isSourceItemsListLoading: false,
        })
        renderComponent({ snippetHelpCenterId: 123 })

        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })

    it('renders children when at least one external file is present', () => {
        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [
                {
                    id: 1,
                    help_center_id: 123,
                    snippets_article_ids: [],
                    filename: 'test.pdf',
                    google_storage_url: 'https://example.com/test.pdf',
                    status: 'SUCCESSFUL' as const,
                    uploaded_datetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isLoading: false,
        })

        renderComponent({ snippetHelpCenterId: 123 })

        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })

    it('renders children when there are available sources even if some are syncing', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [
                {
                    status: 'done',
                    id: 0,
                    source: 'url',
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
                {
                    status: 'loading',
                    id: 1,
                    source: 'url',
                    createdDatetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isSourceItemsListLoading: false,
        })

        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [
                {
                    id: 1,
                    help_center_id: 123,
                    snippets_article_ids: [],
                    filename: 'test.pdf',
                    google_storage_url: 'https://example.com/test.pdf',
                    status: 'SUCCESSFUL' as const,
                    uploaded_datetime: '2021-01-01T00:00:00.000Z',
                },
                {
                    id: 2,
                    help_center_id: 123,
                    snippets_article_ids: [],
                    filename: 'test2.pdf',
                    google_storage_url: 'https://example.com/test2.pdf',
                    status: 'PENDING' as const,
                    uploaded_datetime: '2021-01-01T00:00:00.000Z',
                },
            ],
            isLoading: false,
        })

        renderComponent({ snippetHelpCenterId: 123 })

        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })
})
