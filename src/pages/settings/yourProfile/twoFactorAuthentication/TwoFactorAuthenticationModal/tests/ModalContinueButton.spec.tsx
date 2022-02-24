import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import ModalContinueButton from '../ModalContinueButton'

describe('<ModalContinueButton />', () => {
    const handleContinue = jest.fn()
    const handleFinish = jest.fn()

    describe('render()', () => {
        it.each([1, 2, 3, 999999])(
            'should render the appropriate Continue button based on current step',
            (currentStep) => {
                const {container, queryByText} = render(
                    <ModalContinueButton
                        currentStep={currentStep}
                        onContinue={handleContinue}
                        onFinish={handleFinish}
                    />
                )
                expect(container.firstChild).toMatchSnapshot()

                const continueButton = queryByText(/Continue/i)
                if (!continueButton) {
                    return
                }

                fireEvent.click(continueButton)

                if ([1, 2].includes(currentStep)) {
                    expect(handleContinue).toHaveBeenCalled()
                }

                if (currentStep === 3) {
                    expect(handleFinish).toHaveBeenCalled()
                }
            }
        )
    })
})
