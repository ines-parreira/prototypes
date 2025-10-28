import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {
    KnowledgeHubHeader,
    KnowledgeHubHeaderProps,
} from './KnowledgeHubHeader'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')

const mockUseAiAgentNavigation = useAiAgentNavigation as jest.Mock

describe('KnowledgeHubHeader', () => {
    const defaultProps: KnowledgeHubHeaderProps = {
        data: null,
        shopName: 'test-shop',
    }

    const mockRoutes = {
        knowledge: '/app/ai-agent/shopify/test-shop/knowledge',
        main: '/app/ai-agent/shopify/test-shop',
    }

    beforeEach(() => {
        mockUseAiAgentNavigation.mockReturnValue({
            routes: mockRoutes,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (props: Partial<KnowledgeHubHeaderProps> = {}) => {
        return render(
            <MemoryRouter>
                <KnowledgeHubHeader {...defaultProps} {...props} />
            </MemoryRouter>,
        )
    }

    describe('when data is null', () => {
        it('renders header with Knowledge title as a link', () => {
            renderComponent({ data: null })

            const knowledgeText = screen.getByText('Knowledge')
            expect(knowledgeText).toBeInTheDocument()
            expect(knowledgeText.closest('a')).toHaveAttribute(
                'to',
                mockRoutes.knowledge,
            )
        })

        it('does not render back button', () => {
            renderComponent({ data: null })

            const backButton = screen.queryByLabelText(/back to knowledge hub/i)
            expect(backButton).not.toBeInTheDocument()
        })

        it('renders Test and New knowledge buttons', () => {
            renderComponent({ data: null })

            expect(
                screen.getByRole('button', { name: /test knowledge/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /add new knowledge/i }),
            ).toBeInTheDocument()
        })

        it('calls onTest when Test button is clicked', async () => {
            const onTest = jest.fn()
            renderComponent({ data: null, onTest })

            const testButton = screen.getByRole('button', {
                name: /test knowledge/i,
            })
            await userEvent.click(testButton)

            expect(onTest).toHaveBeenCalledTimes(1)
        })

        it('calls onAddKnowledge when New knowledge button is clicked', async () => {
            const onAddKnowledge = jest.fn()
            renderComponent({ data: null, onAddKnowledge })

            const addButton = screen.getByRole('button', {
                name: /add new knowledge/i,
            })
            await userEvent.click(addButton)

            expect(onAddKnowledge).toHaveBeenCalledTimes(1)
        })

        it('disables Test button when isTestButtonDisabled is true', () => {
            renderComponent({ data: null, isTestButtonDisabled: true })

            const testButton = screen.getByRole('button', {
                name: /test knowledge/i,
            })
            expect(testButton).toBeDisabled()
        })

        it('disables New knowledge button when isAddKnowledgeButtonDisabled is true', () => {
            renderComponent({
                data: null,
                isAddKnowledgeButtonDisabled: true,
            })

            const addButton = screen.getByRole('button', {
                name: /add new knowledge/i,
            })
            expect(addButton).toBeDisabled()
        })
    })

    describe('when data.type is "store-website"', () => {
        const storeWebsiteData = {
            type: 'store-website' as const,
            name: 'My Store Website',
            lastSyncedDate: '2024-01-15T10:30:00Z',
        }

        it('renders back button linking to knowledge hub', () => {
            renderComponent({ data: storeWebsiteData })

            const backButton = screen.getByLabelText(/back to knowledge hub/i)
            expect(backButton).toBeInTheDocument()
            expect(backButton).toHaveAttribute('to', mockRoutes.knowledge)
        })

        it('renders data name as title', () => {
            renderComponent({ data: storeWebsiteData })

            expect(screen.getByText(storeWebsiteData.name)).toBeInTheDocument()
        })

        it('renders last synced date when provided', () => {
            renderComponent({ data: storeWebsiteData })

            expect(screen.getByText(/last synced/i)).toBeInTheDocument()
        })

        it('does not render last synced date when not provided', () => {
            renderComponent({
                data: {
                    type: 'store-website',
                    name: 'My Store Website',
                },
            })

            expect(screen.queryByText(/last synced/i)).not.toBeInTheDocument()
        })

        it('renders Sync store website button', () => {
            renderComponent({ data: storeWebsiteData })

            expect(
                screen.getByRole('button', { name: /sync store website/i }),
            ).toBeInTheDocument()
        })

        it('calls onSync when Sync button is clicked', async () => {
            const onSync = jest.fn()
            renderComponent({
                data: storeWebsiteData,
                onSync,
            })

            const syncButton = screen.getByRole('button', {
                name: /sync store website/i,
            })
            await userEvent.click(syncButton)

            expect(onSync).toHaveBeenCalledTimes(1)
        })

        it('disables Sync button when isSyncButtonDisabled is true', () => {
            renderComponent({
                data: storeWebsiteData,
                isSyncButtonDisabled: true,
            })

            const syncButton = screen.getByRole('button', {
                name: /sync store website/i,
            })
            expect(syncButton).toBeDisabled()
        })

        it('does not render Test or New knowledge buttons', () => {
            renderComponent({ data: storeWebsiteData })

            expect(
                screen.queryByRole('button', { name: /test knowledge/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /add new knowledge/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('when data.type is "urls"', () => {
        const urlsData = {
            type: 'urls' as const,
            name: 'My URL Collection',
            lastSyncedDate: '2024-01-15T10:30:00Z',
            id: 123,
        }

        it('renders back button linking to knowledge hub', () => {
            renderComponent({ data: urlsData })

            const backButton = screen.getByLabelText(/back to knowledge hub/i)
            expect(backButton).toBeInTheDocument()
            expect(backButton).toHaveAttribute('to', mockRoutes.knowledge)
        })

        it('renders data name as title', () => {
            renderComponent({ data: urlsData })

            expect(screen.getByText(urlsData.name)).toBeInTheDocument()
        })

        it('renders last synced date when provided', () => {
            renderComponent({ data: urlsData })

            expect(screen.getByText(/last synced/i)).toBeInTheDocument()
        })

        it('renders Sync URL and Delete buttons', () => {
            renderComponent({ data: urlsData })

            expect(
                screen.getByRole('button', { name: /sync url/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /delete url/i }),
            ).toBeInTheDocument()
        })

        it('calls onSync when Sync URL button is clicked', async () => {
            const onSync = jest.fn()
            renderComponent({ data: urlsData, onSync })

            const syncButton = screen.getByRole('button', { name: /sync url/i })
            await userEvent.click(syncButton)

            expect(onSync).toHaveBeenCalledTimes(1)
        })

        it('calls onDelete when Delete button is clicked', async () => {
            const onDelete = jest.fn()
            renderComponent({ data: urlsData, onDelete })

            const deleteButton = screen.getByRole('button', {
                name: /delete url/i,
            })
            await userEvent.click(deleteButton)

            expect(onDelete).toHaveBeenCalledTimes(1)
        })

        it('disables Sync button when isSyncButtonDisabled is true', () => {
            renderComponent({
                data: urlsData,
                isSyncButtonDisabled: true,
            })

            const syncButton = screen.getByRole('button', { name: /sync url/i })
            expect(syncButton).toBeDisabled()
        })

        it('disables Delete button when isDeleteButtonDisabled is true', () => {
            renderComponent({
                data: urlsData,
                isDeleteButtonDisabled: true,
            })

            const deleteButton = screen.getByRole('button', {
                name: /delete url/i,
            })
            expect(deleteButton).toBeDisabled()
        })
    })

    describe('when data.type is "documents"', () => {
        const documentsData = {
            type: 'documents' as const,
            name: 'My Document',
            id: 456,
        }

        it('renders back button linking to knowledge hub', () => {
            renderComponent({ data: documentsData })

            const backButton = screen.getByLabelText(/back to knowledge hub/i)
            expect(backButton).toBeInTheDocument()
            expect(backButton).toHaveAttribute('to', mockRoutes.knowledge)
        })

        it('renders data name as title', () => {
            renderComponent({ data: documentsData })

            expect(screen.getByText(documentsData.name)).toBeInTheDocument()
        })

        it('does not render last synced date', () => {
            renderComponent({
                data: documentsData,
            })

            expect(screen.queryByText(/last synced/i)).not.toBeInTheDocument()
        })

        it('renders Delete document button', () => {
            renderComponent({ data: documentsData })

            expect(
                screen.getByRole('button', { name: /delete document/i }),
            ).toBeInTheDocument()
        })

        it('calls onDelete when Delete button is clicked', async () => {
            const onDelete = jest.fn()
            renderComponent({
                data: documentsData,
                onDelete,
            })

            const deleteButton = screen.getByRole('button', {
                name: /delete document/i,
            })
            await userEvent.click(deleteButton)

            expect(onDelete).toHaveBeenCalledTimes(1)
        })

        it('disables Delete button when isDeleteButtonDisabled is true', () => {
            renderComponent({
                data: documentsData,
                isDeleteButtonDisabled: true,
            })

            const deleteButton = screen.getByRole('button', {
                name: /delete document/i,
            })
            expect(deleteButton).toBeDisabled()
        })

        it('does not render Sync or Test buttons', () => {
            renderComponent({ data: documentsData })

            expect(
                screen.queryByRole('button', { name: /sync/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('shopName prop handling', () => {
        it('passes shopName to useAiAgentNavigation hook', () => {
            const shopName = 'custom-shop-name'
            renderComponent({ shopName })

            expect(mockUseAiAgentNavigation).toHaveBeenCalledWith({ shopName })
        })
    })
})
