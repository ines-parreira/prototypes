import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import ChurnMitigationOfferFooter from '../ChurnMitigationOfferFooter'

describe('ChurnMitigationOfferFooter', () => {
    const onAcceptMock = jest.fn()
    const onContinueMock = jest.fn()
    const isLoading = false

    afterEach(() => {
        onAcceptMock.mockClear()
        onContinueMock.mockClear()
    })

    it('renders correctly', () => {
        const {getByText} = render(
            <ChurnMitigationOfferFooter
                onAccept={onAcceptMock}
                onContinue={onContinueMock}
                isLoading={isLoading}
            />
        )

        expect(getByText('Accept offer')).toBeInTheDocument()
        expect(getByText('Continue cancelling')).toBeInTheDocument()
    })

    it('calls onAccept when "Accept offer" button is clicked', async () => {
        const {getByText} = render(
            <ChurnMitigationOfferFooter
                onAccept={onAcceptMock}
                onContinue={onContinueMock}
                isLoading={isLoading}
            />
        )

        fireEvent.click(getByText('Accept offer'))
        await waitFor(() => {
            expect(onAcceptMock).toHaveBeenCalledTimes(1)
        })
    })

    it('calls onContinue when "Continue cancelling" button is clicked', async () => {
        const {getByText} = render(
            <ChurnMitigationOfferFooter
                onAccept={onAcceptMock}
                onContinue={onContinueMock}
                isLoading={isLoading}
            />
        )

        fireEvent.click(getByText('Continue cancelling'))
        await waitFor(() => {
            expect(onContinueMock).toHaveBeenCalledTimes(1)
        })
    })

    it('disables buttons when isLoading is true', () => {
        const {getByText} = render(
            <ChurnMitigationOfferFooter
                onAccept={onAcceptMock}
                onContinue={onContinueMock}
                isLoading={true}
            />
        )

        const acceptButton = getByText('Accept offer')
        const continueButton = getByText('Continue cancelling')

        expect(acceptButton).toHaveClass('isDisabled')
        expect(continueButton).toHaveClass('isDisabled')
    })
})
