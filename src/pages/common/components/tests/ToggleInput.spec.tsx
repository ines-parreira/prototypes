import React from 'react'
import {render} from '@testing-library/react'

import ToggleInput from '../../forms/ToggleInput'

describe('ToggleInput', () => {
    const minProps = {
        onClick: jest.fn().mockResolvedValue(null),
        isToggled: true,
    }

    it('should render the checkbox checked', () => {
        const {container} = render(<ToggleInput {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the checkbox unchecked', () => {
        const {container} = render(
            <ToggleInput {...minProps} isToggled={false} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the button loading', () => {
        const {container} = render(<ToggleInput {...minProps} isLoading />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the button disabled', () => {
        const {container} = render(<ToggleInput {...minProps} isDisabled />)

        expect(container.firstChild).toMatchSnapshot()
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
