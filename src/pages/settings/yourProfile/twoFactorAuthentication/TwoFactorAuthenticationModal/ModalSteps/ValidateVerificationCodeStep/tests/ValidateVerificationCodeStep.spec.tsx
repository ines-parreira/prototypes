import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import ValidateVerificationCodeStep from '../ValidateVerificationCodeStep'

describe('<ValidateVerificationCodeStep />', () => {
    const setVerificationCodeMock = jest.fn()
    const setErrorTextMock = jest.fn()
    const setPasswordMock = jest.fn()

    describe('render()', () => {
        it('should render the component with the verification code validation and password if user has one set', () => {
            const {container} = render(
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCodeMock}
                    setErrorText={setErrorTextMock}
                    setUserPassword={setPasswordMock}
                    hasPassword={true}
                />
            )

            expect(container).toMatchSnapshot()
        })

        it('should render the component with the verification code validation and without password none set', () => {
            const {container} = render(
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCodeMock}
                    setErrorText={setErrorTextMock}
                    setUserPassword={setPasswordMock}
                    hasPassword={false}
                />
            )

            expect(container).toMatchSnapshot()
        })

        it('should trigger actions on input change', () => {
            const {getByPlaceholderText} = render(
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCodeMock}
                    setErrorText={setErrorTextMock}
                    setUserPassword={setPasswordMock}
                />
            )

            const inputField = getByPlaceholderText(
                'Enter 6-digit verification code from app or recovery code'
            ) as HTMLInputElement

            fireEvent.change(inputField, {target: {value: '123456'}})

            expect(setVerificationCodeMock).toHaveBeenCalled()
            expect(setErrorTextMock).toHaveBeenCalled()
        })

        it('should show a different title when used as the first step of an update', () => {
            const {container} = render(
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCodeMock}
                    setErrorText={setErrorTextMock}
                    setUserPassword={setPasswordMock}
                    isUpdate={true}
                />
            )

            expect(container).toMatchSnapshot()
        })
    })
})
