import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import CancellationReasonsFooter from '../CancellationReasonsFooter'

describe('CancellationReasonsFooter', () => {
    const onCloseMock = jest.fn()
    const onContinueMock = jest.fn()
    const productType = 'Example Product'
    const continueDisabled = false

    afterEach(() => {
        onCloseMock.mockClear()
        onContinueMock.mockClear()
    })

    it('renders correctly', () => {
        const {getByText} = render(
            <CancellationReasonsFooter
                onClose={onCloseMock}
                productType={productType}
                onContinue={onContinueMock}
                continueDisabled={continueDisabled}
            />
        )

        expect(getByText(`Keep using ${productType}`)).toBeInTheDocument()
        expect(getByText('Continue cancelling')).toBeInTheDocument()
    })

    it('calls onClose when "Keep using" button is clicked', () => {
        const {getByText} = render(
            <CancellationReasonsFooter
                onClose={onCloseMock}
                productType={productType}
                onContinue={onContinueMock}
                continueDisabled={continueDisabled}
            />
        )

        fireEvent.click(getByText(`Keep using ${productType}`))
        expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('calls onContinue when "Continue cancelling" button is clicked', () => {
        const {getByText} = render(
            <CancellationReasonsFooter
                onClose={onCloseMock}
                productType={productType}
                onContinue={onContinueMock}
                continueDisabled={continueDisabled}
            />
        )

        fireEvent.click(getByText('Continue cancelling'))
        expect(onContinueMock).toHaveBeenCalledTimes(1)
    })

    it('disables "Continue cancelling" button when continueDisabled is true', () => {
        const {getByRole} = render(
            <CancellationReasonsFooter
                onClose={onCloseMock}
                productType={productType}
                onContinue={onContinueMock}
                continueDisabled={true}
            />
        )

        const continueButton = getByRole('button', {
            name: 'Continue cancelling',
        })
        expect(continueButton).toBeAriaDisabled()
    })
})
