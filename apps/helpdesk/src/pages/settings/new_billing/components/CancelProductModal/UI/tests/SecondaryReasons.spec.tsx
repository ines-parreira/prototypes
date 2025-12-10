import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import SecondaryReasons from '../SecondaryReasons'

describe('SecondaryReasons', () => {
    const secondaryReasons = ['secondary1', 'secondary2', 'secondary3']

    it('renders with selected secondary reason', () => {
        const { container } = render(
            <SecondaryReasons
                secondaryReasons={secondaryReasons}
                currentReason={null}
                handleSecondaryReasonSelection={jest.fn() as any}
            />,
        )

        const instructionsElement = container.querySelector(
            'div[class="instruction"]',
        )
        expect(instructionsElement).toBeInTheDocument()
        expect(instructionsElement).toHaveTextContent(
            'Could you please share more? *',
        )

        const selectorElement = container.querySelector('fieldset')
        expect(selectorElement).toBeInTheDocument()
        expect(selectorElement).toHaveTextContent('secondary1')
        expect(selectorElement).toHaveTextContent('secondary2')

        container.querySelectorAll('fieldset input').forEach((input) => {
            expect(input).toBeEnabled()
            expect(input).not.toBeChecked()
        })
    })

    it('renders with selected secondary reason being checked', () => {
        const { container } = render(
            <SecondaryReasons
                secondaryReasons={secondaryReasons}
                currentReason={'secondary2'}
                handleSecondaryReasonSelection={jest.fn() as any}
            />,
        )

        container.querySelectorAll('fieldset input').forEach((input) => {
            expect(input).toBeEnabled()
            if (input.id === 'secondary2') {
                expect(input).toBeChecked()
            } else {
                expect(input).not.toBeChecked()
            }
        })
    })

    it('handles onChange event for radio button', () => {
        const mockHandleSecondaryReasonSelection = jest.fn()

        const { container } = render(
            <SecondaryReasons
                secondaryReasons={secondaryReasons}
                currentReason={null}
                handleSecondaryReasonSelection={
                    mockHandleSecondaryReasonSelection
                }
            />,
        )

        const input = container.querySelector('fieldset input')
        expect(input).toBeInTheDocument()
        fireEvent.click(input!, { target: { value: 'secondary1' } })

        expect(mockHandleSecondaryReasonSelection).toHaveBeenCalledWith(
            'secondary1',
        )
    })
})
