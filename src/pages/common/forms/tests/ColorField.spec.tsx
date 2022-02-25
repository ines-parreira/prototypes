import React from 'react'
import {fireEvent, screen, render} from '@testing-library/react'

import ColorField from '../ColorField'

const minProps = {
    label: 'A label',
    onChange: jest.fn(),
    value: '#fff',
}

describe('ColorField', () => {
    it('should render with minimal props', () => {
        const {container} = render(<ColorField {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should call onChange with the clicked color as argument', async () => {
        const buttonColor = '#123456'
        render(<ColorField {...minProps} colors={[buttonColor]} />)
        fireEvent.click(screen.getByRole('button'))
        await screen.findByRole('textbox')
        fireEvent.click(screen.getAllByRole('button')[1])
        expect(minProps.onChange).toHaveBeenCalledWith(buttonColor)
    })
})
