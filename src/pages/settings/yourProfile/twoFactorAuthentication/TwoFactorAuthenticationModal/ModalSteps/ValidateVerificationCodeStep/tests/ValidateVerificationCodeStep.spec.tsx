import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import ValidateVerificationCodeStep from '../ValidateVerificationCodeStep'

describe('<ValidateVerificationCodeStep />', () => {
    const setVerificationCodeMock = jest.fn()
    const setErrorTextMock = jest.fn()

    describe('render()', () => {
        it('should render the component with the verification code validation', () => {
            const { container } = render(
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCodeMock}
                    setErrorText={setErrorTextMock}
                />,
            )

            expect(container).toMatchSnapshot()
            expect(
                screen.queryByPlaceholderText(
                    'Enter 6-digit verification code from app or recovery code',
                ),
            ).toBeInTheDocument()
        })

        it('should trigger actions on input change', () => {
            const { getByPlaceholderText } = render(
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCodeMock}
                    setErrorText={setErrorTextMock}
                />,
            )

            const inputField = getByPlaceholderText(
                'Enter 6-digit verification code from app or recovery code',
            ) as HTMLInputElement

            fireEvent.change(inputField, { target: { value: '123456' } })

            expect(setVerificationCodeMock).toHaveBeenCalled()
            expect(setErrorTextMock).toHaveBeenCalled()
        })

        it('should show a different title when used as the first step of an update', () => {
            const { container } = render(
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCodeMock}
                    setErrorText={setErrorTextMock}
                    isUpdate={true}
                />,
            )

            expect(container).toMatchSnapshot()
        })
    })
})
