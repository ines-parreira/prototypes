import React from 'react'
import {fromJS} from 'immutable'
import {fireEvent, Matcher, render, waitFor} from '@testing-library/react'

import {ChangePasswordContainer} from '../ChangePassword'

jest.mock('lodash/uniqueId', () => (id: string) => `${id}42`)

type fillInFormTypes = {
    getAllByLabelText: (text: Matcher) => HTMLElement[]
    currentPwd?: string
    newPwd?: string
    confirmNewPwd?: string
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
const DEFAULT_NEW_PWD = 'test12345'
const DEFAULT_CONFIRM_PWD = 'test12345'

const fillInForm = ({
    getAllByLabelText,
    currentPwd = DEFAULT_CURRENT_PWD,
    newPwd = DEFAULT_NEW_PWD,
    confirmNewPwd = DEFAULT_CONFIRM_PWD,
}: fillInFormTypes) => {
    fireEvent.change(getAllByLabelText(/Current password/i)[0], {
        target: {value: currentPwd},
    })
    fireEvent.change(getAllByLabelText(/New password/i)[0], {
        target: {value: newPwd},
    })
    fireEvent.change(getAllByLabelText(/Confirm new password/i)[0], {
        target: {value: confirmNewPwd},
    })
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('<ChangePassword />', () => {
    describe('render', () => {
        it('should render the password form', () => {
            const {container} = render(
                <ChangePasswordContainer {...defaultProps} />
            )
            expect(container).toMatchSnapshot()
        })
    })

    describe('Update fields', () => {
        it('should not display error message when having two identical password', () => {
            const {getAllByLabelText, queryByText} = render(
                <ChangePasswordContainer {...defaultProps} />
            )

            fillInForm({
                getAllByLabelText,
                newPwd: 'test12345',
                confirmNewPwd: 'test12345',
            })

            expect(queryByText(/Passwords do not match/i)).toBeNull()
        })

        it('should display the error message when having two different passwords', () => {
            const {getByText, getAllByLabelText} = render(
                <ChangePasswordContainer {...defaultProps} />
            )
            fillInForm({
                getAllByLabelText,
                newPwd: 'test1234',
                confirmNewPwd: 'test12345',
            })
            expect(getByText(/Passwords do not match/i)).toBeTruthy()
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

            const {getAllByText, getAllByLabelText} = render(
                <ChangePasswordContainer
                    {...defaultProps}
                    changePassword={mockChangePassword}
                />
            )

            fillInForm({getAllByLabelText})
            fireEvent.click(getAllByText(/Update Password/i)[1])
            await waitFor(() => {
                expect(mockChangePassword).toHaveBeenLastCalledWith(
                    DEFAULT_CURRENT_PWD,
                    DEFAULT_NEW_PWD
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

            const {getAllByText, getAllByLabelText} = render(
                <ChangePasswordContainer
                    {...defaultProps}
                    changePassword={mockChangePassword}
                />
            )

            fillInForm({getAllByLabelText})
            const button = getAllByText(/Update Password/i)[1]
            fireEvent.click(button)
            await waitFor(() => {
                expect(mockChangePassword).toHaveBeenLastCalledWith(
                    DEFAULT_CURRENT_PWD,
                    DEFAULT_NEW_PWD
                )
                expect(button).toMatchSnapshot()
            })
        })

        it('should empty all the fields when submit successful', async () => {
            const {getAllByText, getAllByLabelText} = render(
                <ChangePasswordContainer {...defaultProps} />
            )

            fillInForm({getAllByLabelText})
            const button = getAllByText(/Update Password/i)[1]
            fireEvent.click(button)

            await waitFor(() => {
                expect(mockChangePassword).toHaveBeenLastCalledWith(
                    DEFAULT_CURRENT_PWD,
                    DEFAULT_NEW_PWD
                )
                expect(
                    (
                        getAllByLabelText(
                            /Current password/i
                        )[0] as HTMLInputElement
                    ).value
                ).toBe('')
                expect(
                    (getAllByLabelText(/New password/i)[0] as HTMLInputElement)
                        .value
                ).toBe('')
                expect(
                    (
                        getAllByLabelText(
                            /Confirm new password/i
                        )[0] as HTMLInputElement
                    ).value
                ).toBe('')
            })
        })
    })
})
