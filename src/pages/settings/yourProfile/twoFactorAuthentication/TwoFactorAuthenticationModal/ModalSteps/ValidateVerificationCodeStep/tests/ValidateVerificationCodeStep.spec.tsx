import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import ValidateVerificationCodeStep from '../ValidateVerificationCodeStep'

describe('<ValidateVerificationCodeStep />', () => {
    const setVerificationCodeMock = jest.fn()
    const setErrorTextMock = jest.fn()

    describe('render()', () => {
        it('should render the component with the verification code validation', () => {
            const {container} = render(
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCodeMock}
                    setErrorText={setErrorTextMock}
                />
            )

            expect(container).toMatchSnapshot()
        })
        it('should trigger actions on input change', () => {
            const {getByPlaceholderText} = render(
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCodeMock}
                    setErrorText={setErrorTextMock}
                />
            )

            const inputField = getByPlaceholderText(
                'Enter 6-digit verification code from app'
            ) as HTMLInputElement

            fireEvent.change(inputField, {target: {value: '123456'}})

            expect(setVerificationCodeMock).toHaveBeenCalled()
            expect(setErrorTextMock).toHaveBeenCalled()
        })
    })
})
