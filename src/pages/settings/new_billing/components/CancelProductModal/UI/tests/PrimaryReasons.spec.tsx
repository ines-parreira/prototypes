import {render, fireEvent} from '@testing-library/react'
import React from 'react'

import PrimaryReasons from '../PrimaryReasons'

describe('PrimaryReasons', () => {
    it('renders with no selected reason', () => {
        const {container, getByText} = render(
            <PrimaryReasons
                reasons={['primary1', 'primary2']}
                currentReason={null}
                handlePrimaryReasonSelection={jest.fn() as any}
            />
        )

        const selectorElement = getByText('Select reason...')
        expect(selectorElement).toBeInTheDocument()

        container.querySelectorAll('fieldset input').forEach((input) => {
            expect(input).toBeEnabled()
            expect(input).not.toBeChecked()
        })
    })

    it('renders with selected reason being checked', () => {
        const {container} = render(
            <PrimaryReasons
                reasons={['primary1', 'primary2']}
                currentReason={'primary2'}
                handlePrimaryReasonSelection={jest.fn() as any}
            />
        )

        container.querySelectorAll('fieldset input').forEach((input) => {
            expect(input).toBeEnabled()
            if (input.id === 'primary2') {
                expect(input).toBeChecked()
            } else {
                expect(input).not.toBeChecked()
            }
        })
    })

    it('handles the change of selected reason', () => {
        const mockHandlePrimaryReasonSelection = jest.fn() as any
        const {getByText} = render(
            <PrimaryReasons
                reasons={['primary1', 'primary2']}
                currentReason={'primary1'}
                handlePrimaryReasonSelection={mockHandlePrimaryReasonSelection}
            />
        )

        const selectorElement = getByText('primary1')

        fireEvent.focus(selectorElement as Element)
        fireEvent.click(getByText('primary2'))
        expect(mockHandlePrimaryReasonSelection).toHaveBeenCalledWith(
            'primary2'
        )
    })
})
