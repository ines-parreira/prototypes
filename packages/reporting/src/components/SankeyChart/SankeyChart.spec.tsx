import { fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { SankeyChart } from './SankeyChart'
import { createLinkRenderer } from './SankeyLink'
import { createNodeRenderer } from './SankeyNode'
import type { SankeyChartData, SankeyLinkClickPayload } from './types'

describe('SankeyChart', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    })

    const mockData: SankeyChartData = {
        nodes: [
            { name: 'Source A', color: '#A084E1' },
            { name: 'Target B', color: '#F08080' },
            { name: 'Target C', color: '#87CEEB' },
        ],
        links: [
            {
                source: 'Source A',
                target: 'Target B',
                value: 100,
                isClickable: true,
            },
            { source: 'Source A', target: 'Target C', value: 50 },
        ],
    }

    const renderComponent = (
        props: Partial<React.ComponentProps<typeof SankeyChart>> = {},
    ) => render(<SankeyChart data={mockData} {...props} />)

    describe('loading state', () => {
        it('should show skeleton when loading', () => {
            const { container } = renderComponent({ isLoading: true })

            const skeletons = container.querySelectorAll(
                '[data-name="skeleton"]',
            )
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('should not show chart when loading', () => {
            const { container } = renderComponent({ isLoading: true })

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).not.toBeInTheDocument()
        })

        it('should show chart when not loading', () => {
            const { container } = renderComponent({ isLoading: false })

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })

        it('should show chart by default when isLoading is not provided', () => {
            const { container } = renderComponent()

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })
    })

    describe('data rendering', () => {
        it('should handle empty nodes and links arrays', () => {
            const emptyData: SankeyChartData = { nodes: [], links: [] }
            const { container } = renderComponent({ data: emptyData })

            expect(container).toBeInTheDocument()
        })
    })
})

describe('createLinkRenderer', () => {
    const nodes = [
        { name: 'Source A', color: '#A084E1' },
        { name: 'Target B', color: '#F08080' },
        { name: 'Target C', color: '#87CEEB' },
    ]

    const links = [
        { source: 0, target: 1, value: 100, isClickable: true },
        { source: 0, target: 2, value: 50 },
    ]

    const baseLinkProps = {
        sourceX: 10,
        targetX: 200,
        sourceY: 50,
        targetY: 80,
        sourceControlX: 100,
        targetControlX: 150,
        sourceRelativeY: 0,
        targetRelativeY: 0,
        linkWidth: 20,
        payload: {
            source: { name: 'Source A' },
            target: { name: 'Target B' },
            value: 100,
        },
    }

    it('should render clickable link with role="button" and aria-label', () => {
        const onLinkClick = vi.fn<(payload: SankeyLinkClickPayload) => void>()
        const LinkRenderer = createLinkRenderer({
            links,
            nodes,
            onLinkClick,
            minLinkWidth: 3,
        })

        const { getByRole } = render(
            <svg>
                <LinkRenderer
                    {...(baseLinkProps as Parameters<typeof LinkRenderer>[0])}
                    index={0}
                />
            </svg>,
        )

        const link = getByRole('button', {
            name: /Link from Source A to Target B/,
        })
        expect(link).toBeInTheDocument()
    })

    it('should call onLinkClick with correct payload when clicking a clickable link', async () => {
        const user = userEvent.setup()
        const onLinkClick = vi.fn<(payload: SankeyLinkClickPayload) => void>()
        const LinkRenderer = createLinkRenderer({
            links,
            nodes,
            onLinkClick,
            minLinkWidth: 3,
        })

        const { getByRole } = render(
            <svg>
                <LinkRenderer
                    {...(baseLinkProps as Parameters<typeof LinkRenderer>[0])}
                    index={0}
                />
            </svg>,
        )

        await user.click(
            getByRole('button', { name: /Link from Source A to Target B/ }),
        )

        expect(onLinkClick).toHaveBeenCalledWith({
            source: nodes[0],
            target: nodes[1],
            value: 100,
            linkIndex: 0,
        })
    })

    it('should not render role="button" for non-clickable links', () => {
        const onLinkClick = vi.fn<(payload: SankeyLinkClickPayload) => void>()
        const LinkRenderer = createLinkRenderer({
            links,
            nodes,
            onLinkClick,
            minLinkWidth: 3,
        })

        const { container } = render(
            <svg>
                <LinkRenderer
                    {...({
                        ...baseLinkProps,
                        index: 1,
                        payload: {
                            source: { name: 'Source A' },
                            target: { name: 'Target C' },
                            value: 50,
                        },
                    } as Parameters<typeof LinkRenderer>[0])}
                />
            </svg>,
        )

        expect(
            container.querySelector('[role="button"]'),
        ).not.toBeInTheDocument()
    })

    it('should not call onLinkClick when clicking a non-clickable link', async () => {
        const user = userEvent.setup()
        const onLinkClick = vi.fn<(payload: SankeyLinkClickPayload) => void>()
        const LinkRenderer = createLinkRenderer({
            links,
            nodes,
            onLinkClick,
            minLinkWidth: 3,
        })

        const { container } = render(
            <svg>
                <LinkRenderer
                    {...({
                        ...baseLinkProps,
                        index: 1,
                        payload: {
                            source: { name: 'Source A' },
                            target: { name: 'Target C' },
                            value: 50,
                        },
                    } as Parameters<typeof LinkRenderer>[0])}
                />
            </svg>,
        )

        const path = container.querySelector('path')!
        await user.click(path)

        expect(onLinkClick).not.toHaveBeenCalled()
    })

    it('should call onLinkHoverChange with label and targetLabel on mouse move', () => {
        const onLinkHoverChange = vi.fn()
        const LinkRenderer = createLinkRenderer({
            links,
            nodes,
            onLinkHoverChange,
            minLinkWidth: 3,
        })

        const { container } = render(
            <svg>
                <LinkRenderer
                    {...(baseLinkProps as Parameters<typeof LinkRenderer>[0])}
                    index={0}
                />
            </svg>,
        )

        const path = container.querySelector('path')!
        fireEvent.mouseMove(path, { clientX: 120, clientY: 80 })

        expect(onLinkHoverChange).toHaveBeenCalledWith({
            value: 100,
            x: 120,
            y: 80,
            label: 'Source A',
            targetLabel: 'Target B',
        })
    })

    it('should call onLinkHoverChange with null on mouse leave', () => {
        const onLinkHoverChange = vi.fn()
        const LinkRenderer = createLinkRenderer({
            links,
            nodes,
            onLinkHoverChange,
            minLinkWidth: 3,
        })

        const { container } = render(
            <svg>
                <LinkRenderer
                    {...(baseLinkProps as Parameters<typeof LinkRenderer>[0])}
                    index={0}
                />
            </svg>,
        )

        const path = container.querySelector('path')!
        fireEvent.mouseLeave(path)

        expect(onLinkHoverChange).toHaveBeenCalledWith(null)
    })

    it('should call onLinkSourceHover with source index and target color on mouse enter', () => {
        const onLinkSourceHover = vi.fn()
        const LinkRenderer = createLinkRenderer({
            links,
            nodes,
            onLinkSourceHover,
            minLinkWidth: 3,
        })

        const { container } = render(
            <svg>
                <LinkRenderer
                    {...(baseLinkProps as Parameters<typeof LinkRenderer>[0])}
                    index={0}
                />
            </svg>,
        )

        fireEvent.mouseEnter(container.querySelector('path')!)

        expect(onLinkSourceHover).toHaveBeenCalledWith(0, '#F08080')
    })

    it('should call onLinkSourceHover with null, null on mouse leave', () => {
        const onLinkSourceHover = vi.fn()
        const LinkRenderer = createLinkRenderer({
            links,
            nodes,
            onLinkSourceHover,
            minLinkWidth: 3,
        })

        const { container } = render(
            <svg>
                <LinkRenderer
                    {...(baseLinkProps as Parameters<typeof LinkRenderer>[0])}
                    index={0}
                />
            </svg>,
        )

        fireEvent.mouseLeave(container.querySelector('path')!)

        expect(onLinkSourceHover).toHaveBeenCalledWith(null, null)
    })

    it('should not fire hover callbacks for non-clickable links', () => {
        const onLinkHoverChange = vi.fn()
        const onLinkSourceHover = vi.fn()
        const LinkRenderer = createLinkRenderer({
            links,
            nodes,
            onLinkHoverChange,
            onLinkSourceHover,
            minLinkWidth: 3,
        })

        const { container } = render(
            <svg>
                <LinkRenderer
                    {...({
                        ...baseLinkProps,
                        index: 1,
                        payload: {
                            source: { name: 'Source A' },
                            target: { name: 'Target C' },
                            value: 50,
                        },
                    } as Parameters<typeof LinkRenderer>[0])}
                />
            </svg>,
        )

        const path = container.querySelector('path')!
        fireEvent.mouseEnter(path)
        fireEvent.mouseMove(path, { clientX: 100, clientY: 100 })
        fireEvent.mouseLeave(path)

        expect(onLinkHoverChange).not.toHaveBeenCalled()
        expect(onLinkSourceHover).not.toHaveBeenCalled()
    })

    it('should render fallback path for unknown link index', () => {
        const LinkRenderer = createLinkRenderer({
            links,
            nodes,
            minLinkWidth: 3,
        })

        const { container } = render(
            <svg>
                <LinkRenderer
                    {...({
                        ...baseLinkProps,
                        index: 999,
                    } as Parameters<typeof LinkRenderer>[0])}
                />
            </svg>,
        )

        const path = container.querySelector('path')!
        expect(path).toBeInTheDocument()
        expect(path.getAttribute('stroke')).toBe('#ccc')
        expect(path).toHaveStyle({ strokeOpacity: 0.15 })
    })
})

describe('createNodeRenderer', () => {
    const nodes = [
        { name: 'Source A', color: '#A084E1' },
        { name: 'Target B', color: '#F08080' },
        { name: 'Target C', color: '#87CEEB' },
    ]

    const baseNodeProps = {
        x: 10,
        y: 20,
        width: 8,
        height: 100,
        index: 0,
        payload: { value: 100 },
    }

    it('should render node label, value, and percentage', () => {
        const renderer = createNodeRenderer({
            nodes,
            totalSourceValue: 200,
        })

        const { getByText } = render(
            <svg>
                {renderer(baseNodeProps as Parameters<typeof renderer>[0])}
            </svg>,
        )

        expect(getByText('Source A')).toBeInTheDocument()
        expect(getByText((100).toLocaleString())).toBeInTheDocument()
        expect(getByText('50.0%')).toBeInTheDocument()
    })

    it('should use custom valueFormatter', () => {
        const renderer = createNodeRenderer({
            nodes,
            totalSourceValue: 200,
            valueFormatter: (v) => `$${v}`,
        })

        const { getByText } = render(
            <svg>
                {renderer(baseNodeProps as Parameters<typeof renderer>[0])}
            </svg>,
        )

        expect(getByText('$100')).toBeInTheDocument()
    })

    it('should display 0.0% when totalSourceValue is zero', () => {
        const renderer = createNodeRenderer({
            nodes,
            totalSourceValue: 0,
        })

        const { getByText } = render(
            <svg>
                {renderer(baseNodeProps as Parameters<typeof renderer>[0])}
            </svg>,
        )

        expect(getByText('0.0%')).toBeInTheDocument()
    })

    it('should return empty <g> for invalid node index', () => {
        const renderer = createNodeRenderer({
            nodes,
            totalSourceValue: 200,
        })

        const { container } = render(
            <svg>
                {renderer({
                    ...baseNodeProps,
                    index: 999,
                } as Parameters<typeof renderer>[0])}
            </svg>,
        )

        const textElements = container.querySelectorAll('text')
        expect(textElements).toHaveLength(0)
    })
})
