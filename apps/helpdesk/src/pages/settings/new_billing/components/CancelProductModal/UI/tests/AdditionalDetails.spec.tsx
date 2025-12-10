import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import AdditionalDetails from '../AdditionalDetails'

describe('AdditionalDetails', () => {
    it('renders without required asterisk', () => {
        const { getByText, getByPlaceholderText, queryByText } = render(
            <AdditionalDetails
                currentDetails={null}
                handleAdditionalDetailsChange={jest.fn() as any}
            />,
        )

        const instructionText = getByText('Please share any additional details')
        const asterisk = queryByText('*')

        expect(instructionText).toBeInTheDocument()
        expect(asterisk).toBeNull()

        const textArea = getByPlaceholderText(
            "It didn't work out for me because...",
        )
        expect(textArea).toBeInTheDocument()
    })

    it('handles onChange event for TextArea', () => {
        const mockHandleAdditionalDetailsChange = jest.fn()

        const details = 'Something went wrong...'
        const { getByText } = render(
            <AdditionalDetails
                currentDetails={details}
                handleAdditionalDetailsChange={
                    mockHandleAdditionalDetailsChange
                }
            />,
        )

        const textArea = getByText(details)
        const newDetails = 'New details'

        fireEvent.change(textArea, { target: { value: newDetails } })

        expect(mockHandleAdditionalDetailsChange).toHaveBeenCalledWith(
            newDetails,
        )
    })

    it('renders with empty value when currentDetails is null', () => {
        const { getByPlaceholderText } = render(
            <AdditionalDetails
                currentDetails={null}
                handleAdditionalDetailsChange={jest.fn() as any}
            />,
        )

        const textArea = getByPlaceholderText(
            "It didn't work out for me because...",
        ) as HTMLTextAreaElement

        expect(textArea.value).toBe('')
    })
})
