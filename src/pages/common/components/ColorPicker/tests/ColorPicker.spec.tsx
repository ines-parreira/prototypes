import React from 'react'
import {fireEvent, screen, render} from '@testing-library/react'

import ColorPicker from '../ColorPicker'

const minProps = {
    onChange: jest.fn(),
}

describe('<ColorPicker />', () => {
    beforeEach(() => {
        minProps.onChange.mockReset()
    })

    it('should render with minimal props', () => {
        const {container} = render(<ColorPicker {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with background color matching value', () => {
        const {container} = render(
            <ColorPicker value="#fff" defaultValue="#000" {...minProps} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with background color matching defaultValue', () => {
        const {container} = render(
            <ColorPicker defaultValue="#000" {...minProps} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display popup on button click with default colors, inside container', async () => {
        const {container} = render(
            <div id="container">
                <ColorPicker
                    {...minProps}
                    popupContainer="container"
                    value="#fff"
                />
            </div>
        )
        fireEvent.click(screen.getByRole('button'))
        await screen.findByRole('textbox')
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display popup on button click with provided colors', async () => {
        const {container} = render(
            <ColorPicker {...minProps} colors={['#fff']} />
        )
        fireEvent.click(screen.getByRole('button'))
        await screen.findByRole('textbox')
        expect(container.parentElement).toMatchSnapshot()
    })

    it('should call onChange with the clicked color as argument', async () => {
        const buttonColor = '#123456'
        render(<ColorPicker {...minProps} colors={[buttonColor]} />)
        fireEvent.click(screen.getByRole('button'))
        await screen.findByRole('textbox')
        fireEvent.click(screen.getAllByRole('button')[1])
        expect(minProps.onChange).toHaveBeenCalledWith(buttonColor)
    })
})
