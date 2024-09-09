import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import {useFlag} from 'common/flags'
import ValidateVerificationCodeStep from '../ValidateVerificationCodeStep'

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
const useFlagMock = useFlag as jest.Mock

describe('<ValidateVerificationCodeStep />', () => {
    const setVerificationCodeMock = jest.fn()
    const setErrorTextMock = jest.fn()
    const setPasswordMock = jest.fn()

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

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
            expect(
                screen.queryByText('Enter your password.')
            ).toBeInTheDocument()
        })

        it('should not prompt for password when requiring a recent login instead', () => {
            useFlagMock.mockReturnValue(true)

            render(
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCodeMock}
                    setErrorText={setErrorTextMock}
                    setUserPassword={setPasswordMock}
                    hasPassword={true}
                />
            )

            expect(
                screen.queryByText('Enter your password.')
            ).not.toBeInTheDocument()
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
            expect(
                screen.queryByText('Enter your password.')
            ).not.toBeInTheDocument()
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
