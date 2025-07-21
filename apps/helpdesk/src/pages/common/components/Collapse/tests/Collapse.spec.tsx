import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import Collapse from '../Collapse'

describe('<Collapse />', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.clearAllTimers()
    })

    it('should render collapse component', () => {
        render(<Collapse>FooBar</Collapse>)
        expect(screen.getByText('FooBar')).toBeInTheDocument()
    })

    it('should be collapse by default', () => {
        render(<Collapse>FooBar</Collapse>)
        expect(screen.getByText('FooBar')).toHaveClass('isCollapsed')
    })

    it('should not be collapsed when isOpen is true', () => {
        render(<Collapse isOpen>FooBar</Collapse>)
        expect(screen.getByText('FooBar')).not.toHaveClass('isCollapsed')
    })

    it.each([
        ['height', 'vertical'],
        ['width', 'horizontal'],
    ] as const)(
        'should set %s to null when isOpen is true',
        (prop, direction) => {
            render(
                <Collapse isOpen direction={direction}>
                    FooBar
                </Collapse>,
            )
            expect(screen.getByText('FooBar').style[prop]).toBe('')
        },
    )

    it.each([
        ['height', 'vertical'],
        ['width', 'horizontal'],
    ] as const)('should not set %s when isOpen is false', (prop, direction) => {
        render(
            <Collapse isOpen={false} direction={direction}>
                FooBar
            </Collapse>,
        )
        expect(screen.getByText('FooBar').style[prop]).toBe('')
    })

    it('should apply correct classes', async () => {
        const { rerender } = render(<Collapse isOpen={false}>FooBar</Collapse>)
        rerender(<Collapse isOpen>FooBar</Collapse>)
        expect(screen.getByText('FooBar')).toHaveClass('isCollapsing')
        jest.advanceTimersByTime(350)
        expect(screen.getByText('FooBar')).not.toHaveClass('isCollapsed')

        rerender(<Collapse isOpen={false}>FooBar</Collapse>)
        expect(screen.getByText('FooBar')).toHaveClass('isCollapsing')
        jest.advanceTimersByTime(350)
        await waitFor(() => {
            expect(screen.getByText('FooBar')).toHaveClass('isCollapsed')
        })
    })

    it.each([
        ['height', 'vertical'],
        ['width', 'horizontal'],
    ] as const)(
        'should set inline style to 0 when isOpen changes to false and remove after transition',
        async (prop, direction) => {
            const { rerender } = render(
                <Collapse isOpen direction={direction}>
                    FooBar
                </Collapse>,
            )
            rerender(
                <Collapse isOpen={false} direction={direction}>
                    FooBar
                </Collapse>,
            )
            expect(screen.getByText('FooBar').style[prop]).toBe('0px')
            jest.advanceTimersByTime(350)
            await waitFor(() => {
                expect(screen.getByText('FooBar').style[prop]).toBe('')
            })
        },
    )
})
