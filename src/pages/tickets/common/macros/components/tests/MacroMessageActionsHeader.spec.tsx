import React from 'react'

import {Map, List} from 'immutable'

import {render, screen, fireEvent} from '@testing-library/react'

import {MacroActionName} from 'models/macroAction/types'

import MacroMessageActionsHeader from '../MacroMessageActionsHeader'

const onSelect = jest.fn()

const minProps = {
    actions: List(),
    onSelect,
}

describe('MacroMessageActionsHeader', () => {
    beforeEach(() => {
        onSelect.mockReset()
    })

    it('should fire onSelect on unused option', () => {
        render(
            <MacroMessageActionsHeader
                {...minProps}
                type={MacroActionName.SetResponseText}
            >
                test
            </MacroMessageActionsHeader>
        )

        fireEvent.click(screen.getByText('Internal note'))
        expect(onSelect).toBeCalled()
    })

    it('should not fire onSelect on current option', () => {
        render(
            <MacroMessageActionsHeader
                {...minProps}
                type={MacroActionName.SetResponseText}
            >
                test
            </MacroMessageActionsHeader>
        )

        fireEvent.click(screen.getByText('Response text'))
        expect(onSelect).not.toBeCalled()
    })

    it('should not fire onSelect on used option', () => {
        const {container} = render(
            <MacroMessageActionsHeader
                {...minProps}
                actions={List([Map({name: MacroActionName.AddInternalNote})])}
                type={MacroActionName.SetResponseText}
            >
                test
            </MacroMessageActionsHeader>
        )

        fireEvent.click(screen.getByText('Internal note'))

        expect(onSelect).not.toBeCalled()
        expect(container.firstChild).toMatchSnapshot()
    })
})
