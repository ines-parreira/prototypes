import { fireEvent, render, screen } from '@testing-library/react'
import { List, Map } from 'immutable'

import { MacroActionName } from 'models/macroAction/types'

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
            </MacroMessageActionsHeader>,
        )

        fireEvent.click(screen.getByText('Internal note'))
        expect(onSelect).toHaveBeenCalled()
    })

    it('should not fire onSelect on current option', () => {
        render(
            <MacroMessageActionsHeader
                {...minProps}
                type={MacroActionName.SetResponseText}
            >
                test
            </MacroMessageActionsHeader>,
        )

        fireEvent.click(screen.getByText('Response text'))
        expect(onSelect).not.toHaveBeenCalled()
    })

    it('should not fire onSelect on used option', () => {
        const { container } = render(
            <MacroMessageActionsHeader
                {...minProps}
                actions={List([Map({ name: MacroActionName.AddInternalNote })])}
                type={MacroActionName.SetResponseText}
            >
                test
            </MacroMessageActionsHeader>,
        )

        fireEvent.click(screen.getByText('Internal note'))

        expect(onSelect).not.toHaveBeenCalled()
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show Forward by email option', () => {
        render(
            <MacroMessageActionsHeader
                {...minProps}
                type={MacroActionName.ForwardByEmail}
            >
                test
            </MacroMessageActionsHeader>,
        )

        expect(screen.getByText('Forward by email')).toBeInTheDocument()
    })
})
