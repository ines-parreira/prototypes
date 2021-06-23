import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'

import {MacroButton} from '../MacroButton'

import {setTextAction, macroFixture} from '../../../../../../../fixtures/macro'
jest.mock('draft-js/lib/generateRandomKey', () => () => '42')

const applyMacro = jest.fn()
const onHover = jest.fn()

const minProps: ComponentProps<typeof MacroButton> = {
    macro: macroFixture,
    applyMacro,
    onHover: onHover,
}

describe('<MacroButton />', () => {
    it('should render the button', () => {
        const {container} = render(<MacroButton {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should apply macro on click', () => {
        const {getByRole} = render(<MacroButton {...minProps} />)
        fireEvent.click(getByRole('button'))
        expect(applyMacro).toHaveBeenCalled()
    })

    it('should open the popover on hover', () => {
        const {baseElement, getByRole} = render(
            <MacroButton
                {...minProps}
                macro={{...macroFixture, actions: [setTextAction]}}
            />
        )
        fireEvent.mouseEnter(getByRole('button'))
        expect(baseElement.children[1]).toMatchSnapshot()
        expect(onHover).toHaveBeenCalled()
    })
})
