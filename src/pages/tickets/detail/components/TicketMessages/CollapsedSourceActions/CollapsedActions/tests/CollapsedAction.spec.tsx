import React from 'react'

import {Dropdown} from 'reactstrap'

import {fireEvent, render, screen} from '@testing-library/react'

import CollapsedAction from '../CollapsedAction'

const mockClick = jest.fn()

const renderAction = ({nested = false, disabled = false} = {}) =>
    render(
        <Dropdown toggle={() => ({})}>
            <CollapsedAction
                icon={<div>icon</div>}
                title="Title"
                description="Description"
                onClick={mockClick}
                nested={nested}
                disabled={disabled}
            />
        </Dropdown>
    )

describe('CollapsedAction', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should call onClick function', () => {
        renderAction()
        fireEvent.click(screen.getByText('Title'))
        expect(mockClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick function when disabled', () => {
        renderAction({disabled: true})
        fireEvent.click(screen.getByText('Title'))
        expect(mockClick).toHaveBeenCalledTimes(0)
    })

    it('should display dropdown item with arrow icon', () => {
        const {container} = renderAction({nested: true})
        expect(container.firstChild).toMatchSnapshot()
    })
})
