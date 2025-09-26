import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { appQueryClient } from 'api/queryClient'

import { PlaygroundPreview } from './PlaygroundPreview'

describe('PlaygroundPreview', () => {
    it('renders messages from content prop', () => {
        const content = ['Message 1', 'Message 2']
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={content}
                    isGeneratingMessages={false}
                />
            </QueryClientProvider>,
        )
        expect(screen.getByText('Today')).toBeInTheDocument()
        expect(screen.getByText('24 hours later')).toBeInTheDocument()
        expect(screen.getByText('Message 1')).toBeInTheDocument()
        expect(screen.getByText('Message 2')).toBeInTheDocument()
    })

    it('renders placeholder when content is empty', () => {
        const content = [] as string[]
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={content}
                    isGeneratingMessages={false}
                />
            </QueryClientProvider>,
        )
        expect(
            screen.getByText('AI agent ready to preview messages'),
        ).toBeInTheDocument()
    })

    it('renders placeholder when content is undefined', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={undefined}
                    isGeneratingMessages={false}
                />
            </QueryClientProvider>,
        )
        expect(
            screen.getByText('AI agent ready to preview messages'),
        ).toBeInTheDocument()
    })

    it('renders GeneratingMessage when isGeneratingMessages is true', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview isGeneratingMessages={true} />
            </QueryClientProvider>,
        )
        expect(screen.getByText('Generating messages')).toBeInTheDocument()
    })

    it('highlights fake links in messages', () => {
        const content = ['Check this link: https://example.com']
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={content}
                    isGeneratingMessages={false}
                />
            </QueryClientProvider>,
        )
        const link = screen.getByText('https://example.com')
        expect(link).toBeInTheDocument()
        expect(link).toHaveClass('fakeLink')
    })

    it('scrolls to the bottom when content changes', () => {
        const { rerender } = render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={['Message 1']}
                    isGeneratingMessages={false}
                />
            </QueryClientProvider>,
        )
        const previewBody = document.querySelector(
            '.previewBody',
        ) as HTMLDivElement
        Object.defineProperty(previewBody, 'scrollHeight', {
            value: 100,
            writable: true,
        })
        Object.defineProperty(previewBody, 'scrollTop', {
            value: 0,
            writable: true,
        })

        rerender(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={['Message 1', 'Message 2']}
                    isGeneratingMessages={false}
                />
            </QueryClientProvider>,
        )
        expect(previewBody.scrollTop).toBe(100)
    })
})
