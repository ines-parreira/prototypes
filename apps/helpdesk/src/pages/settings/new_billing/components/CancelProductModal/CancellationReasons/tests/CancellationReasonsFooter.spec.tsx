import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import CancellationReasonsFooter from '../CancellationReasonsFooter'

describe('CancellationReasonsFooter', () => {
    const onCloseMock = jest.fn()
    const onContinueMock = jest.fn()
    const productDisplayName = 'Example Product'
    const continueDisabled = false

    afterEach(() => {
        onCloseMock.mockClear()
        onContinueMock.mockClear()
    })

    it('renders correctly', () => {
        const { getByText } = render(
            <CancellationReasonsFooter
                onClose={onCloseMock}
                productDisplayName={productDisplayName}
                onContinue={onContinueMock}
                continueDisabled={continueDisabled}
            />,
        )

        expect(
            getByText(`Keep My ${productDisplayName} Plan`),
        ).toBeInTheDocument()
        expect(getByText('Continue To Cancel')).toBeInTheDocument()
    })

    it('calls onClose when "Keep using" button is clicked', () => {
        const { getByText } = render(
            <CancellationReasonsFooter
                onClose={onCloseMock}
                productDisplayName={productDisplayName}
                onContinue={onContinueMock}
                continueDisabled={continueDisabled}
            />,
        )

        fireEvent.click(getByText(`Keep My ${productDisplayName} Plan`))
        expect(onCloseMock).toHaveBeenCalledTimes(1)
    })

    it('calls onContinue when "Continue cancelling" button is clicked', () => {
        const { getByText } = render(
            <CancellationReasonsFooter
                onClose={onCloseMock}
                productDisplayName={productDisplayName}
                onContinue={onContinueMock}
                continueDisabled={continueDisabled}
            />,
        )

        fireEvent.click(getByText('Continue To Cancel'))
        expect(onContinueMock).toHaveBeenCalledTimes(1)
    })

    it('disables "Continue cancelling" button when continueDisabled is true', () => {
        const { getByRole } = render(
            <CancellationReasonsFooter
                onClose={onCloseMock}
                productDisplayName={productDisplayName}
                onContinue={onContinueMock}
                continueDisabled={true}
            />,
        )

        const continueButton = getByRole('button', {
            name: 'Continue To Cancel',
        })
        expect(continueButton).toBeAriaDisabled()
    })
})
