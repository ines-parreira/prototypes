import { render, screen } from '@testing-library/react'

import type { FormattedSyncingMessage } from '../../utils/knowledgeSourcesAnalysis'
import { SyncingSourcesMessage } from './SyncingSourcesMessage'

describe('SyncingSourcesMessage', () => {
    it('should render singular form for single source', () => {
        const message: FormattedSyncingMessage = {
            count: 1,
            sources: [{ label: 'Domain', name: 'example.com' }],
        }

        render(<SyncingSourcesMessage message={message} />)

        expect(screen.getByText('1')).toBeInTheDocument()
        expect(
            screen.getByText(/knowledge source currently syncing:/),
        ).toBeInTheDocument()
    })

    it('should render plural form for multiple sources', () => {
        const message: FormattedSyncingMessage = {
            count: 2,
            sources: [
                { label: 'Domain', name: 'example.com' },
                { label: 'URL', name: 'https://example.org' },
            ],
        }

        render(<SyncingSourcesMessage message={message} />)

        expect(screen.getByText('2')).toBeInTheDocument()
        expect(
            screen.getByText(/knowledge sources currently syncing:/),
        ).toBeInTheDocument()
    })

    it('should render bullet list with source items', () => {
        const message: FormattedSyncingMessage = {
            count: 2,
            sources: [
                { label: 'Domain', name: 'example.com' },
                { label: 'File', name: 'document.pdf' },
            ],
        }

        render(<SyncingSourcesMessage message={message} />)

        const listItems = screen.getAllByRole('listitem')
        expect(listItems).toHaveLength(2)

        expect(screen.getByText(/Domain:.*example\.com/)).toBeInTheDocument()
        expect(screen.getByText(/File:.*document\.pdf/)).toBeInTheDocument()
    })

    it('should render source name without label for empty label', () => {
        const message: FormattedSyncingMessage = {
            count: 1,
            sources: [{ label: '', name: 'Help Center' }],
        }

        render(<SyncingSourcesMessage message={message} />)

        expect(screen.getByText('Help Center')).toBeInTheDocument()
        expect(screen.queryByText(':')).not.toBeInTheDocument()
    })

    it('should render the availability message', () => {
        const message: FormattedSyncingMessage = {
            count: 1,
            sources: [{ label: 'Domain', name: 'example.com' }],
        }

        render(<SyncingSourcesMessage message={message} />)

        expect(
            screen.getByText(
                /The knowledge will become available once syncing is complete\./,
            ),
        ).toBeInTheDocument()
    })

    it('should highlight count with bold', () => {
        const message: FormattedSyncingMessage = {
            count: 3,
            sources: [
                { label: 'Domain', name: 'example.com' },
                { label: 'URL', name: 'https://example.org' },
                { label: 'File', name: 'doc.pdf' },
            ],
        }

        const { container } = render(
            <SyncingSourcesMessage message={message} />,
        )

        const strongElements = container.querySelectorAll('strong')
        expect(strongElements.length).toBeGreaterThan(0)
        expect(strongElements[0].textContent).toBe('3')
    })

    it('should render label with name in list item', () => {
        const message: FormattedSyncingMessage = {
            count: 1,
            sources: [{ label: 'Domain', name: 'example.com' }],
        }

        const { container } = render(
            <SyncingSourcesMessage message={message} />,
        )

        const listItem = container.querySelector('li')
        expect(listItem?.textContent).toMatch(/Domain:.*example\.com/)
    })
})
