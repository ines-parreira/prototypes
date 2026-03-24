import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'

import type { FolderSyncStatus } from './FolderSyncBanner'
import { FolderSyncBanner } from './FolderSyncBanner'

const renderBanner = (status: FolderSyncStatus, folderType: KnowledgeType) => {
    return render(
        <ThemeProvider>
            <FolderSyncBanner status={status} folderType={folderType} />
        </ThemeProvider>,
    )
}

describe('FolderSyncBanner', () => {
    it('renders syncing banner for URL type', () => {
        renderBanner('syncing', KnowledgeType.URL)

        expect(
            screen.getByText('Your URL is syncing. This may take a moment...'),
        ).toBeInTheDocument()
    })

    it('renders syncing banner for Domain type', () => {
        renderBanner('syncing', KnowledgeType.Domain)

        expect(
            screen.getByText(
                'Your store website is syncing. This may take a moment...',
            ),
        ).toBeInTheDocument()
    })

    it('renders success banner', () => {
        renderBanner('success', KnowledgeType.URL)

        expect(
            screen.getByText(
                'URL has synced successfully and is in use by the AI Agent. Review generated content for accuracy.',
            ),
        ).toBeInTheDocument()
    })

    it('renders error banner', () => {
        renderBanner('error', KnowledgeType.URL)

        expect(
            screen.getByText(
                "We couldn't sync your URL. AI Agent is using your previous content. Please try again or contact support if the issue persists.",
            ),
        ).toBeInTheDocument()
    })

    it('returns null for unknown status', () => {
        const { container } = renderBanner(
            'unknown' as FolderSyncStatus,
            KnowledgeType.URL,
        )

        expect(container.innerHTML).toBe('')
    })

    it('banner is dismissible', async () => {
        const user = userEvent.setup()
        renderBanner('syncing', KnowledgeType.URL)

        const closeButton = screen.getByRole('button', { name: /close/i })
        await user.click(closeButton)

        expect(
            screen.queryByText(
                'Your URL is syncing. This may take a moment...',
            ),
        ).not.toBeInTheDocument()
    })
})
