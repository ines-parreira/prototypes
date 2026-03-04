import { render, screen } from '@testing-library/react'

import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'

describe('TruncatedTextWithTooltip', () => {
    // Store cleanup function to be called in afterEach
    let cleanupMocks: (() => void) | null = null

    // Ensure cleanup runs after each test, even if test fails
    afterEach(() => {
        if (cleanupMocks) {
            cleanupMocks()
            cleanupMocks = null
        }
    })

    // Helper to get the wrapper div
    const getWrapperDiv = (container: HTMLElement) => {
        return container.querySelector('div') as HTMLDivElement
    }

    // Mock scrollWidth and clientWidth before rendering
    const setupMockDimensions = (scrollWidth: number, clientWidth: number) => {
        const originalScrollWidth = Object.getOwnPropertyDescriptor(
            HTMLElement.prototype,
            'scrollWidth',
        )
        const originalClientWidth = Object.getOwnPropertyDescriptor(
            HTMLElement.prototype,
            'clientWidth',
        )

        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
            configurable: true,
            get() {
                return scrollWidth
            },
        })

        Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
            configurable: true,
            get() {
                return clientWidth
            },
        })

        return () => {
            if (originalScrollWidth) {
                Object.defineProperty(
                    HTMLElement.prototype,
                    'scrollWidth',
                    originalScrollWidth,
                )
            }
            if (originalClientWidth) {
                Object.defineProperty(
                    HTMLElement.prototype,
                    'clientWidth',
                    originalClientWidth,
                )
            }
        }
    }

    // Helper to setup and track cleanup
    const setupDimensions = (scrollWidth: number, clientWidth: number) => {
        // Clean up any existing mocks first
        if (cleanupMocks) {
            cleanupMocks()
        }
        cleanupMocks = setupMockDimensions(scrollWidth, clientWidth)
    }

    describe('rendering', () => {
        it('renders children correctly', () => {
            render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip text">
                    <span>Child content</span>
                </TruncatedTextWithTooltip>,
            )

            expect(screen.getByText('Child content')).toBeInTheDocument()
        })

        it('applies custom className', () => {
            const { container } = render(
                <TruncatedTextWithTooltip
                    tooltipContent="Tooltip text"
                    className="custom-class"
                >
                    <span>Content</span>
                </TruncatedTextWithTooltip>,
            )

            const wrapper = container.querySelector('.custom-class')
            expect(wrapper).toBeInTheDocument()
        })

        it('renders without custom className', () => {
            const { container } = render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip text">
                    <span>Content</span>
                </TruncatedTextWithTooltip>,
            )

            const wrapper = container.firstChild
            expect(wrapper).toBeInTheDocument()
        })
    })

    describe('truncation detection', () => {
        it('detects truncated text when scrollWidth > clientWidth', () => {
            setupDimensions(200, 100)

            render(
                <TruncatedTextWithTooltip tooltipContent="Full tooltip text">
                    <span>Truncated text</span>
                </TruncatedTextWithTooltip>,
            )

            // Tooltip wrapper should be present for truncated text
            expect(screen.getByText('Truncated text')).toBeInTheDocument()
        })

        it('does not detect truncation when scrollWidth <= clientWidth', () => {
            setupDimensions(100, 200)

            const { container } = render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip text">
                    <span>Short text</span>
                </TruncatedTextWithTooltip>,
            )

            // Text should still be rendered
            expect(screen.getByText('Short text')).toBeInTheDocument()

            // Container should only have the wrapper div (no tooltip)
            const divs = container.querySelectorAll('div')
            expect(divs.length).toBe(1)
        })

        it('re-checks truncation when tooltipContent changes', () => {
            setupDimensions(100, 200)

            const { rerender } = render(
                <TruncatedTextWithTooltip tooltipContent="Short">
                    <span>Text content</span>
                </TruncatedTextWithTooltip>,
            )

            // Initially not truncated
            expect(screen.getByText('Text content')).toBeInTheDocument()

            // Now mock truncation
            setupDimensions(300, 100)

            rerender(
                <TruncatedTextWithTooltip tooltipContent="Very long tooltip content">
                    <span>Text content</span>
                </TruncatedTextWithTooltip>,
            )

            // Should still render content
            expect(screen.getByText('Text content')).toBeInTheDocument()
        })
    })

    describe('tooltip behavior', () => {
        it('renders wrapper div when text is truncated', () => {
            setupDimensions(200, 100)
            const tooltipText = 'Full tooltip text content'

            const { container } = render(
                <TruncatedTextWithTooltip tooltipContent={tooltipText}>
                    <span>Text</span>
                </TruncatedTextWithTooltip>,
            )

            // Should render the content
            expect(screen.getByText('Text')).toBeInTheDocument()

            // Should have wrapper div with truncated class
            const wrapper = getWrapperDiv(container)
            expect(wrapper).toHaveClass('truncated')
        })

        it('renders simple div when text is not truncated', () => {
            setupDimensions(50, 100)

            const { container } = render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip text">
                    <span>Short text</span>
                </TruncatedTextWithTooltip>,
            )

            // Should still render content
            expect(screen.getByText('Short text')).toBeInTheDocument()

            // Should only have the wrapper div
            const divs = container.querySelectorAll('div')
            expect(divs.length).toBe(1)
        })

        it('applies truncated CSS class to wrapper', () => {
            setupDimensions(100, 100)

            const { container } = render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip">
                    <span>Text</span>
                </TruncatedTextWithTooltip>,
            )

            const wrapper = getWrapperDiv(container)
            expect(wrapper).toHaveClass('truncated')
        })
    })

    describe('edge cases', () => {
        it('handles empty children', () => {
            render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip">
                    <span></span>
                </TruncatedTextWithTooltip>,
            )

            expect(
                screen.getByText('', { selector: 'span' }),
            ).toBeInTheDocument()
        })

        it('handles null ref during mount', () => {
            const { container } = render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip">
                    <span>Content</span>
                </TruncatedTextWithTooltip>,
            )

            // Should not crash when ref is not yet attached
            expect(container.firstChild).toBeInTheDocument()
        })

        it('handles multiple children', () => {
            render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip">
                    <span>First</span>
                    <span>Second</span>
                </TruncatedTextWithTooltip>,
            )

            expect(screen.getByText('First')).toBeInTheDocument()
            expect(screen.getByText('Second')).toBeInTheDocument()
        })

        it('handles complex nested children', () => {
            render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip">
                    <div>
                        <span>Nested</span>
                        <strong>Content</strong>
                    </div>
                </TruncatedTextWithTooltip>,
            )

            expect(screen.getByText('Nested')).toBeInTheDocument()
            expect(screen.getByText('Content')).toBeInTheDocument()
        })
    })

    describe('component structure', () => {
        it('wraps content in div with ref', () => {
            setupDimensions(100, 100)

            const { container } = render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip content">
                    <span>Text content</span>
                </TruncatedTextWithTooltip>,
            )

            const wrapper = getWrapperDiv(container)
            expect(wrapper).toBeInTheDocument()
            expect(wrapper).toContainElement(screen.getByText('Text content'))
        })

        it('maintains content structure when not truncated', () => {
            setupDimensions(50, 100)

            const { container } = render(
                <TruncatedTextWithTooltip tooltipContent="Tooltip">
                    <div>
                        <span>Part 1</span>
                        <span>Part 2</span>
                    </div>
                </TruncatedTextWithTooltip>,
            )

            expect(screen.getByText('Part 1')).toBeInTheDocument()
            expect(screen.getByText('Part 2')).toBeInTheDocument()

            const wrapper = getWrapperDiv(container)
            expect(wrapper).toBeInTheDocument()
        })
    })
})
