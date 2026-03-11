import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { appQueryClient } from 'api/queryClient'

import { PlaygroundPreview } from './PlaygroundPreview'

describe('PlaygroundPreview', () => {
    it('renders messages from content prop', () => {
        const content = ['Message 1', 'Message 2']
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview content={content} />
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
            '.messagesContainer',
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

    it('should render image when includeImage is true and selected product has image src', () => {
        const content = ['blublu'] as string[]
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={content}
                    isGeneratingMessages={false}
                    includeImage={true}
                    selectedProductImage={{
                        src: 'https://example.com/image.jpg',
                        alt: 'Example Image',
                        variant_ids: [],
                    }}
                />
            </QueryClientProvider>,
        )
        expect(screen.getByAltText('Example Image')).toBeInTheDocument()
        expect(screen.getByText('blublu')).toBeInTheDocument()
    })

    it('should render image only at first message', () => {
        const content = ['blublu', 'blablabla'] as string[]
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={content}
                    isGeneratingMessages={false}
                    includeImage={true}
                    selectedProductImage={{
                        src: 'https://example.com/image.jpg',
                        alt: 'Example Image',
                        variant_ids: [],
                    }}
                />
            </QueryClientProvider>,
        )
        expect(screen.getByAltText('Example Image')).toBeInTheDocument()
        expect(screen.getAllByAltText('Example Image')).toHaveLength(1)
        expect(screen.getByText('blublu')).toBeInTheDocument()
        expect(screen.getByText('blablabla')).toBeInTheDocument()
    })

    it("should use alt fallback when product image doesn't have it", () => {
        const content = ['blublu'] as string[]
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={content}
                    isGeneratingMessages={false}
                    includeImage={true}
                    selectedProductImage={{
                        src: 'https://example.com/image.jpg',
                        alt: undefined,
                        variant_ids: [],
                    }}
                />
            </QueryClientProvider>,
        )
        expect(
            screen.getByAltText('selected-product-image'),
        ).toBeInTheDocument()
        expect(screen.getByText('blublu')).toBeInTheDocument()
    })

    it('should not render image when includeImage is false', () => {
        const content = ['blublu'] as string[]
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={content}
                    isGeneratingMessages={false}
                    includeImage={false}
                    selectedProductImage={{
                        src: 'https://example.com/image.jpg',
                        alt: 'Example Image',
                        variant_ids: [],
                    }}
                />
            </QueryClientProvider>,
        )
        expect(screen.queryByText('Example Image')).not.toBeInTheDocument()
        expect(screen.getByText('blublu')).toBeInTheDocument()
    })

    it('should not render image when selectedProductImage src is empty', () => {
        const content = ['blublu'] as string[]
        render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={content}
                    isGeneratingMessages={false}
                    includeImage={false}
                    selectedProductImage={{
                        src: '',
                        alt: 'Example Image',
                        variant_ids: [],
                    }}
                />
            </QueryClientProvider>,
        )
        expect(screen.queryByText('Example Image')).not.toBeInTheDocument()
        expect(screen.getByText('blublu')).toBeInTheDocument()
    })

    it('should not render image when selectedProductImage is not passed', () => {
        const content = ['blublu'] as string[]
        const { container } = render(
            <QueryClientProvider client={appQueryClient}>
                <PlaygroundPreview
                    content={content}
                    isGeneratingMessages={false}
                    includeImage={false}
                />
            </QueryClientProvider>,
        )
        expect(
            container.querySelector('.attachedImage'),
        ).not.toBeInTheDocument()
        expect(screen.getByText('blublu')).toBeInTheDocument()
    })
})
