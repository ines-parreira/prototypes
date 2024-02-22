import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import OtherReason from '../OtherReason'

describe('OtherReason', () => {
    it('renders with * when isRequired is true', () => {
        const {getByText, getByPlaceholderText} = render(
            <OtherReason
                isRequired={true}
                currentReason={null}
                handleOtherReasonChange={jest.fn() as any}
            />
        )

        const instructionText = getByText('Please share any additional details')
        const asterisk = getByText('*')

        expect(instructionText).toBeInTheDocument()
        expect(asterisk).toBeInTheDocument()

        const textArea = getByPlaceholderText(
            "It didn't work out for me because..."
        )
        expect(textArea).toBeInTheDocument()
    })

    it('renders without * when isRequired is false', () => {
        const {getByText, getByPlaceholderText, queryByText} = render(
            <OtherReason
                isRequired={false}
                currentReason={null}
                handleOtherReasonChange={jest.fn() as any}
            />
        )

        const instructionText = getByText('Please share any additional details')
        const asterisk = queryByText('*')

        expect(instructionText).toBeInTheDocument()
        expect(asterisk).toBeNull()

        const textArea = getByPlaceholderText(
            "It didn't work out for me because..."
        )
        expect(textArea).toBeInTheDocument()
    })

    it('handles onChange event for TextArea', () => {
        const mockHandleOtherReasonChange = jest.fn()

        const reason = 'Something went wrong...'
        const {getByText} = render(
            <OtherReason
                isRequired={false}
                currentReason={reason}
                handleOtherReasonChange={mockHandleOtherReasonChange}
            />
        )

        const textArea = getByText(reason)
        const newReason = 'New reason'

        fireEvent.change(textArea, {target: {value: newReason}})

        expect(mockHandleOtherReasonChange).toHaveBeenCalledWith(newReason)
    })
})
