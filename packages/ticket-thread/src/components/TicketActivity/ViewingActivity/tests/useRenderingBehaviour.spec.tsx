import { useRef } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useRenderingBehaviour } from '../useRenderingBehaviour'

type RenderingBehaviourHarnessProps = {
    hasAgents: boolean
    height: number
    initialScrollTop?: number
}

function RenderingBehaviourHarness({
    hasAgents,
    height,
    initialScrollTop = 0,
}: RenderingBehaviourHarnessProps) {
    const rootRef = useRef<HTMLDivElement | null>(null)
    const behaviour = useRenderingBehaviour({
        hasAgents,
        height,
        rootRef,
    })

    return (
        <>
            <div aria-label="root" ref={(node) => (rootRef.current = node)} />
            <div
                aria-label="scroll-container"
                ref={(node) => {
                    if (node) {
                        node.scrollTop = initialScrollTop
                    }
                }}
            />
            <output aria-label="reserve-space">
                {String(behaviour.shouldReserveSpace)}
            </output>
        </>
    )
}

describe('useRenderingBehaviour', () => {
    it('reserves space when the scroll container starts at the top', () => {
        render(
            <RenderingBehaviourHarness
                hasAgents
                height={42}
                initialScrollTop={0}
            />,
        )

        expect(screen.getByLabelText('reserve-space')).toHaveTextContent('true')
    })

    it('starts without reserved space when the scroll container is already scrolled', () => {
        render(
            <RenderingBehaviourHarness
                hasAgents
                height={42}
                initialScrollTop={10}
            />,
        )

        expect(screen.getByLabelText('reserve-space')).toHaveTextContent(
            'false',
        )
    })

    it('drops the reserved space after scrolling past the banner height', () => {
        render(
            <RenderingBehaviourHarness
                hasAgents
                height={42}
                initialScrollTop={0}
            />,
        )

        const scrollContainer = screen.getByLabelText(
            'scroll-container',
        ) as HTMLDivElement

        scrollContainer.scrollTop = 42
        fireEvent.scroll(scrollContainer)

        expect(screen.getByLabelText('reserve-space')).toHaveTextContent(
            'false',
        )
        expect(scrollContainer.scrollTop).toBe(0)
    })

    it('restores the reserved space when scrolling back to the top', () => {
        render(
            <RenderingBehaviourHarness
                hasAgents
                height={42}
                initialScrollTop={0}
            />,
        )

        const scrollContainer = screen.getByLabelText(
            'scroll-container',
        ) as HTMLDivElement

        scrollContainer.scrollTop = 42
        fireEvent.scroll(scrollContainer)

        scrollContainer.scrollTop = 0
        fireEvent.scroll(scrollContainer)

        expect(screen.getByLabelText('reserve-space')).toHaveTextContent('true')
    })

    it('resets to the default state when there are no agents', () => {
        const { rerender } = render(
            <RenderingBehaviourHarness
                hasAgents
                height={42}
                initialScrollTop={10}
            />,
        )

        rerender(
            <RenderingBehaviourHarness
                hasAgents={false}
                height={42}
                initialScrollTop={10}
            />,
        )

        expect(screen.getByLabelText('reserve-space')).toHaveTextContent('true')
    })
})
