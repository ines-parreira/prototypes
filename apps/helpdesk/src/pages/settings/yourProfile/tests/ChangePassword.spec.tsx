import React from 'react'

import type { Matcher } from '@testing-library/react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { ChangePasswordContainer } from '../ChangePassword'

jest.mock('lodash/uniqueId', () => (id: string) => `${id}42`)

type fillInFormTypes = {
    getAllByLabelText: (text: Matcher) => HTMLElement[]
    currentPwd?: string
    newPwd?: string
    confirmNewPwd?: string
    twoFaCode?: string
}

const mockChangePassword = jest.fn().mockResolvedValue({
    reason: '',
    error: {},
})

const defaultProps = {
    currentUser: fromJS({}),
    changePassword: mockChangePassword,
}

const DEFAULT_CURRENT_PWD = 'test1234'
const DEFAULT_NEW_PWD = 'P@ssw0rd123!!!'
const DEFAULT_CONFIRM_PWD = 'P@ssw0rd123!!!'
const DEFAULT_TWO_FA_CODE = ''

const fillInForm = ({
    getAllByLabelText,
    currentPwd = DEFAULT_CURRENT_PWD,
    newPwd = DEFAULT_NEW_PWD,
    confirmNewPwd = DEFAULT_CONFIRM_PWD,
    twoFaCode = DEFAULT_TWO_FA_CODE,
}: fillInFormTypes) => {
    fireEvent.change(getAllByLabelText(/Current password/i)[0], {
        target: { value: currentPwd },
    })
    fireEvent.change(getAllByLabelText(/New password/i)[0], {
        target: { value: newPwd },
    })
    fireEvent.change(getAllByLabelText(/Confirm new password/i)[0], {
        target: { value: confirmNewPwd },
    })
    if (twoFaCode !== DEFAULT_TWO_FA_CODE) {
        fireEvent.change(getAllByLabelText(/2FA Code/i)[0], {
            target: { value: twoFaCode },
        })
    }
}

describe('<ChangePassword />', () => {
    describe('render', () => {
        it('should render the password form', () => {
            const { container } = render(
                <ChangePasswordContainer {...defaultProps} />,
            )
            expect(container).toMatchSnapshot()
        })
    })

    describe('Update fields', () => {
        it('should not display error message when having two identical password', () => {
            const { getAllByLabelText, queryByText } = render(
                <ChangePasswordContainer {...defaultProps} />,
            )

            fillInForm({
                getAllByLabelText,
                newPwd: 'test12345',
                confirmNewPwd: 'test12345',
            })

            expect(queryByText(/Passwords do not match/i)).toBeNull()
        })

        it('should display the error message when having two different passwords', () => {
            const { getByText, getAllByLabelText } = render(
                <ChangePasswordContainer {...defaultProps} />,
            )
            fillInForm({
                getAllByLabelText,
                newPwd: 'test1234',
                confirmNewPwd: 'test12345',
            })
            expect(getByText(/Passwords do not match/i)).toBeTruthy()
        })

        it('should display the error message when the new password does not meet the requirements', () => {
            const { getByText, getAllByLabelText } = render(
                <ChangePasswordContainer {...defaultProps} />,
            )
            fillInForm({
                getAllByLabelText,
                newPwd: 'test12345',
                confirmNewPwd: 'test12345',
            })
            expect(
                getByText(
                    /A password must contain a minimum of 14 characters, 1 lower case, 1 upper case and 1 number./i,
                ),
            ).toBeTruthy()
        })

        it('should not display the 2FA code input if not enabled', () => {
            const currentUser = fromJS({
                has_2fa_enabled: false,
            })
            const { queryByLabelText } = render(
                <ChangePasswordContainer
                    {...defaultProps}
                    currentUser={currentUser}
                />,
            )
            expect(queryByLabelText(/2FA Code/i)).toBeNull()
        })

        it('should display the error message when 2FA code is missing', () => {
            const currentUser = fromJS({
                has_2fa_enabled: true,
            })
            const { getAllByLabelText } = render(
                <ChangePasswordContainer
                    {...defaultProps}
                    currentUser={currentUser}
                />,
            )
            fillInForm({
                getAllByLabelText,
                newPwd: 'test12345',
                confirmNewPwd: 'test12345',
            })
        })
    })

    describe('handleSubmit', () => {
        it('should display error below the current password field when submitting the wrong one', async () => {
            const errorMessage = 'error_generic'
            const mockChangePassword = jest.fn().mockResolvedValue({
                reason: 'error',
                error: {
                    response: {
                        data: {
                            error: {
                                data: {
                                    old_password: errorMessage,
                                },
                            },
                        },
                    },
                },
            })

            const { getAllByText, getAllByLabelText } = render(
                <ChangePasswordContainer
                    {...defaultProps}
                    changePassword={mockChangePassword}
                />,
            )

            fillInForm({ getAllByLabelText })
            fireEvent.click(getAllByText(/Update Password/i)[1])
            await waitFor(() => {
                expect(mockChangePassword).toHaveBeenLastCalledWith(
                    DEFAULT_CURRENT_PWD,
                    DEFAULT_NEW_PWD,
                    DEFAULT_TWO_FA_CODE,
                )
                getAllByText(errorMessage)[0]
            })
        })

        it('should not disable button if network error', async () => {
            const mockChangePassword = jest.fn().mockResolvedValue({
                reason: 'error',
                error: {
                    message: 'Network Error',
                },
            })

            const { getAllByText, getAllByLabelText } = render(
                <ChangePasswordContainer
                    {...defaultProps}
                    changePassword={mockChangePassword}
                />,
            )

            fillInForm({ getAllByLabelText })
            const button = getAllByText(/Update Password/i)[1]
            fireEvent.click(button)
            await waitFor(() => {
                expect(mockChangePassword).toHaveBeenLastCalledWith(
                    DEFAULT_CURRENT_PWD,
                    DEFAULT_NEW_PWD,
                    DEFAULT_TWO_FA_CODE,
                )
                expect(button).toMatchSnapshot()
            })
        })

        it('should disable button because some fields are empty', async () => {
            const mockChangePassword = jest.fn().mockResolvedValue({})

            const { getAllByText, getAllByLabelText, getByRole } = render(
                <ChangePasswordContainer
                    {...defaultProps}
                    changePassword={mockChangePassword}
                />,
            )

            fillInForm({
                getAllByLabelText,
                currentPwd: '',
                newPwd: '',
                confirmNewPwd: '',
            })
            const button = getByRole('button', { name: /Update Password/i })
            fireEvent.click(button)
            await waitFor(() => {
                expect(mockChangePassword).toHaveBeenCalledTimes(0)
                expect(getAllByText('Please fill out this field.').length).toBe(
                    3,
                )
                expect(button).toBeAriaDisabled()
            })
        })

        it('should empty all the fields when submit successful', async () => {
            const currentUser = fromJS({
                has_2fa_enabled: true,
            })
            const { getAllByText, getAllByLabelText } = render(
                <ChangePasswordContainer
                    {...defaultProps}
                    currentUser={currentUser}
                />,
            )
            const twoFaCode = '123456'
            fillInForm({ getAllByLabelText, twoFaCode: twoFaCode })
            const button = getAllByText(/Update Password/i)[1]
            fireEvent.click(button)

            await waitFor(() => {
                expect(mockChangePassword).toHaveBeenLastCalledWith(
                    DEFAULT_CURRENT_PWD,
                    DEFAULT_NEW_PWD,
                    twoFaCode,
                )
                expect(
                    (
                        getAllByLabelText(
                            /Current password/i,
                        )[0] as HTMLInputElement
                    ).value,
                ).toBe('')
                expect(
                    (getAllByLabelText(/New password/i)[0] as HTMLInputElement)
                        .value,
                ).toBe('')
                expect(
                    (
                        getAllByLabelText(
                            /Confirm new password/i,
                        )[0] as HTMLInputElement
                    ).value,
                ).toBe('')
                expect(
                    (getAllByLabelText(/2FA Code/i)[0] as HTMLInputElement)
                        .value,
                ).toBe('')
            })
        })
    })
})
