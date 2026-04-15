import { forwardRef } from 'react'
import type { ReactNode } from 'react'

import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as Axiom from '@gorgias/axiom'

import { render } from '../../../../tests/render.utils'
import type { ActivityParticipant } from '../../helpers/activityParticipants'
import { ActivityOverflowList } from '../ActivityOverflowList'

const overflowListState = vi.hoisted(() => ({
    allItemsFit: true,
    hiddenCount: 0,
    visibleCount: Number.POSITIVE_INFINITY,
    registerShowMoreButton: vi.fn(),
}))

const overflowListRenderState = vi.hoisted(() => ({
    itemIndex: 0,
}))

vi.mock('@gorgias/axiom', async () => {
    const actual = await vi.importActual<typeof Axiom>('@gorgias/axiom')

    return {
        ...actual,
        Avatar: ({ name, url }: { name: string; url?: string }) => (
            <div aria-label={`Avatar ${name}`} data-url={url} />
        ),
        Tooltip: ({
            children,
            trigger,
        }: {
            children: ReactNode
            trigger: ReactNode
        }) => (
            <div>
                {trigger}
                <div style={{ display: 'none' }}>{children}</div>
            </div>
        ),
        TooltipContent: ({ children }: { children: ReactNode }) => (
            <div aria-label="overflowed participants tooltip">{children}</div>
        ),
        OverflowList: ({
            children,
            className,
        }: {
            children: ReactNode
            className?: string
        }) => {
            overflowListRenderState.itemIndex = 0

            return <div className={className}>{children}</div>
        },
        OverflowListItem: forwardRef<
            HTMLDivElement,
            {
                children: ReactNode
            }
        >(function MockOverflowListItem({ children }, ref) {
            const currentIndex = overflowListRenderState.itemIndex
            overflowListRenderState.itemIndex += 1

            if (currentIndex >= overflowListState.visibleCount) {
                return null
            }

            return <div ref={ref}>{children}</div>
        }),
        useOverflowList: vi.fn(() => ({
            allItemsFit: overflowListState.allItemsFit,
            hiddenCount: overflowListState.hiddenCount,
            isExpanded: false,
            itemVisibilityMap: new Map(),
            registerItem: vi.fn(),
            registerShowMoreButton: overflowListState.registerShowMoreButton,
            setIsExpanded: vi.fn(),
            unregisterItem: vi.fn(),
        })),
    }
})

const buildParticipant = (id: number, name: string): ActivityParticipant => ({
    id,
    name,
    meta: {
        profile_picture_url: `https://example.com/${id}.png`,
    },
})

const getUserVisibleTextContent = (container: HTMLElement) => {
    // strip hidden trailing content before reading text so assertions reflect
    // the sentence a user actually sees.
    const clone = container.cloneNode(true) as HTMLElement

    clone.querySelectorAll<HTMLElement>('*').forEach((element) => {
        if (element.style.display === 'none') {
            element.remove()
        }
    })

    return clone.textContent?.replace(/\s+/g, ' ').trim()
}

describe('ActivityOverflowList', () => {
    beforeEach(() => {
        overflowListState.registerShowMoreButton.mockClear()
    })

    it('renders participants with the inline trailing content when all items fit', () => {
        overflowListState.allItemsFit = true
        overflowListState.hiddenCount = 0
        overflowListState.visibleCount = Number.POSITIVE_INFINITY

        const { container } = render(
            <ActivityOverflowList
                participants={[
                    buildParticipant(1, 'Alice'),
                    buildParticipant(2, 'Bob'),
                ]}
                renderTrailingContent={() => (
                    <span> are also viewing this ticket</span>
                )}
            />,
        )

        expect(getUserVisibleTextContent(container)).toBe(
            'Alice and Bob are also viewing this ticket',
        )
        expect(overflowListState.registerShowMoreButton).toHaveBeenCalledWith(
            expect.any(HTMLDivElement),
        )
    })

    it('passes overflow state to the trailing content and hides overflowed participants', () => {
        overflowListState.allItemsFit = false
        overflowListState.hiddenCount = 2
        overflowListState.visibleCount = 2

        const { container } = render(
            <ActivityOverflowList
                participants={[
                    buildParticipant(1, 'Alice'),
                    buildParticipant(2, 'Bob'),
                    buildParticipant(3, 'Carol'),
                    buildParticipant(4, 'Dave'),
                ]}
                renderTrailingContent={(params) => (
                    <span>{`${params?.visibleParticipantsCount ?? 0} visible / ${params?.hiddenCount ?? 0} hidden`}</span>
                )}
            />,
        )

        expect(getUserVisibleTextContent(container)).toBe(
            'Alice, Bob2 visible / 2 hidden',
        )
        expect(getUserVisibleTextContent(container)).not.toContain('Carol')
        expect(getUserVisibleTextContent(container)).not.toContain('Dave')
        expect(overflowListState.registerShowMoreButton).toHaveBeenCalledWith(
            expect.any(HTMLDivElement),
        )
    })

    it('renders the overflowed participant names inside the tooltip content', () => {
        overflowListState.allItemsFit = false
        overflowListState.hiddenCount = 2
        overflowListState.visibleCount = 2

        render(
            <ActivityOverflowList
                participants={[
                    buildParticipant(1, 'Alice'),
                    buildParticipant(2, 'Bob'),
                    buildParticipant(3, 'Carol'),
                    buildParticipant(4, 'Dave'),
                ]}
                renderTrailingContent={() => <span>suffix</span>}
            />,
        )

        expect(
            screen.getByLabelText('overflowed participants tooltip'),
        ).toHaveTextContent('Carol')
        expect(
            screen.getByLabelText('overflowed participants tooltip'),
        ).toHaveTextContent('Dave')
        expect(screen.getByLabelText('Avatar Carol')).toBeInTheDocument()
        expect(screen.getByLabelText('Avatar Dave')).toBeInTheDocument()
    })

    it('falls back to Unknown for missing name in list and an empty avatar url for overflowed participants without data', () => {
        overflowListState.allItemsFit = false
        overflowListState.hiddenCount = 1
        overflowListState.visibleCount = 1

        render(
            <ActivityOverflowList
                participants={[
                    buildParticipant(1, 'Alice'),
                    {
                        id: 2,
                        name: null,
                        meta: null,
                    },
                ]}
                renderTrailingContent={() => <span>suffix</span>}
            />,
        )

        expect(
            screen.getByLabelText('overflowed participants tooltip'),
        ).toHaveTextContent('Unknown')
        expect(screen.getByLabelText('Avatar Unknown')).toHaveAttribute(
            'data-url',
            '',
        )
    })

    it('unregisters the trailing element on unmount', () => {
        overflowListState.allItemsFit = false
        overflowListState.hiddenCount = 1
        overflowListState.visibleCount = 1

        const { unmount } = render(
            <ActivityOverflowList
                participants={[buildParticipant(1, 'Alice')]}
                renderTrailingContent={() => <span>suffix</span>}
            />,
        )

        unmount()

        expect(
            overflowListState.registerShowMoreButton,
        ).toHaveBeenLastCalledWith(null)
    })
})
