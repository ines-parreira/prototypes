import React, { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import PreviewRadioFieldSet from '../PreviewRadioFieldSet'

describe('<PreviewRadioFieldSet />', () => {
    const minProps: ComponentProps<typeof PreviewRadioFieldSet> = {
        options: [
            {
                label: 'sushis and sashimis',
                value: 'japanese',
            },
            {
                label: 'tacos and nachos',
                value: 'mexican',
            },
        ],
        value: 'japanese',
        onChange: jest.fn(),
    }

    describe('render()', () => {
        it('should render an enabled Radio field', () => {
            const option = minProps.options[1]

            render(<PreviewRadioFieldSet {...minProps} />)

            fireEvent.click(screen.getByText(option.label as any))
            expect(minProps.onChange).toHaveBeenCalledWith(option.value)
        })

        it('should render a disabled PreviewRadioButton', () => {
            const option = minProps.options[1]
            option.disabled = true
            render(<PreviewRadioFieldSet {...minProps} />)

            fireEvent.click(screen.getByText(option.label as any))
            expect(minProps.onChange).not.toHaveBeenCalledWith(option.value)
        })
    })
})
