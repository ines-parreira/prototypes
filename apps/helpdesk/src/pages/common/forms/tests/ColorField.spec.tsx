import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import ColorField from '../ColorField'

jest.mock('@gorgias/toolkit-react', () => {
    const React = jest.requireActual('react') as typeof import('react')

    return {
        ...jest.requireActual('@gorgias/toolkit-react'),
        useId: jest.fn(function useIdMock() {
            const id = React.useRef<string | undefined>(undefined)

            if (id.current === undefined) {
                id.current = require('lodash/uniqueId')()
            }

            return id.current
        }),
    }
})

const minProps = {
    label: 'A label',
    onChange: jest.fn(),
    value: '#fff',
}

describe('ColorField', () => {
    it('should render with minimal props', () => {
        const { container } = render(<ColorField {...minProps} />)
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
