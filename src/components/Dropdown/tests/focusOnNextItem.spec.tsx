import React, {
    KeyboardEvent as KeyboardEventType,
    MutableRefObject,
    useRef,
} from 'react'

import { render, waitFor } from '@testing-library/react'

import focusOnNextItem from '../focusOnNextItem'

describe.skip('focusOnNextItem', () => {
    let activeElement: Element | null
    let ref: MutableRefObject<HTMLDivElement | null>

    const DummyComponent = () => {
        ref = useRef(null)
        return (
            <div ref={ref}>
                <div role="listitem" tabIndex={0}>
                    one
                </div>
                <div role="listitem" tabIndex={0}>
                    two
                </div>
                <div role="listitem" tabIndex={0}>
                    three
                </div>
                <div role="listitem" tabIndex={0}>
                    four
                </div>
            </div>
        )
    }

    beforeAll(() => {
        activeElement = document.activeElement
    })

    afterEach(() => {
        Object.defineProperty(document, 'activeElement', {
            value: activeElement,
            configurable: true,
        })
    })

    it('should focus on previous item', async () => {
        const { getByText } = render(<DummyComponent />)
        const focusedElement = getByText('one')

        const event = {
            currentTarget: focusedElement,
            key: 'ArrowUp',
            preventDefault: jest.fn(),
        } as unknown as KeyboardEventType<HTMLElement>

        Object.defineProperty(document, 'activeElement', {
            value: focusedElement,
            configurable: true,
        })

        focusOnNextItem(event, ref)
        await waitFor(() => expect(getByText('four')).toHaveFocus())
    })

    it('should focus on next item', () => {
        const { getByText } = render(<DummyComponent />)
        const focusedElement = getByText('one')

        const event = {
            currentTarget: focusedElement,
            key: 'ArrowDown',
            preventDefault: jest.fn(),
        } as unknown as KeyboardEventType<HTMLElement>

        Object.defineProperty(document, 'activeElement', {
            value: focusedElement,
            configurable: true,
        })

        focusOnNextItem(event, ref)
        expect(getByText('two')).toHaveFocus()
    })
})
