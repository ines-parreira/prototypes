import React from 'react'
import {render, screen} from '@testing-library/react'

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

    it('should set height to null when isOpen is true', () => {
        render(<Collapse isOpen>FooBar</Collapse>)
        expect(screen.getByText('FooBar').style.height).toBe('')
    })

    it('should not set height when isOpen is false', () => {
        render(<Collapse isOpen={false}>FooBar</Collapse>)
        expect(screen.getByText('FooBar').style.height).toBe('')
    })

    it('should apply correct classes', () => {
        const {rerender} = render(<Collapse isOpen={false}>FooBar</Collapse>)
        rerender(<Collapse isOpen>FooBar</Collapse>)
        expect(screen.getByText('FooBar')).toHaveClass('isCollapsing')
        jest.runTimersToTime(350)
        expect(screen.getByText('FooBar')).not.toHaveClass('isCollapsed')

        rerender(<Collapse isOpen={false}>FooBar</Collapse>)
        expect(screen.getByText('FooBar')).toHaveClass('isCollapsing')
        jest.runTimersToTime(350)
        expect(screen.getByText('FooBar')).toHaveClass('isCollapsed')
    })

    it('should set inline style to 0 when isOpen changes to false and remove after transition', () => {
        const {rerender} = render(<Collapse isOpen>FooBar</Collapse>)
        rerender(<Collapse isOpen={false}>FooBar</Collapse>)
        expect(screen.getByText('FooBar').style.height).toBe('0px')
        jest.runTimersToTime(350)
        expect(screen.getByText('FooBar').style.height).toBe('')
    })
})
