import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import ToggleInput from '../ToggleInput'

describe('ToggleInput', () => {
    const mockOnCall = jest.fn().mockResolvedValue(null)
    const minProps = {
        onClick: mockOnCall,
        isToggled: true,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the checkbox checked', () => {
        const {container} = render(<ToggleInput {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should be allowed to toggle, and call the onClick callback', () => {
        const {getByRole} = render(<ToggleInput {...minProps} />)

        fireEvent.click(getByRole('switch'))
        expect(mockOnCall).toHaveBeenCalled()
    })

    it('should render the checkbox unchecked', () => {
        const {container} = render(
            <ToggleInput {...minProps} isToggled={false} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the button loading, and have onClick disabled', () => {
        const {container, getByRole} = render(
            <ToggleInput {...minProps} isLoading />
        )

        expect(container.firstChild).toMatchSnapshot()

        fireEvent.click(getByRole('switch'))
        expect(mockOnCall).not.toHaveBeenCalled()
    })

    it('should render the button disabled, and have onClick disabled', () => {
        const {container, getByRole} = render(
            <ToggleInput {...minProps} isDisabled />
        )

        expect(container.firstChild).toMatchSnapshot()

        fireEvent.click(getByRole('switch'))
        expect(mockOnCall).not.toHaveBeenCalled()
    })

    it('should render the button loading and disabled', () => {
        const {container} = render(
            <ToggleInput {...minProps} isLoading isDisabled />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render label', () => {
        const {container} = render(
            <ToggleInput {...minProps}>Label</ToggleInput>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render caption', () => {
        const {container} = render(
            <ToggleInput {...minProps} caption="caption">
                Label
            </ToggleInput>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
