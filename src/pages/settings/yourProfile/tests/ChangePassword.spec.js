// @flow
import React from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'

import InputField from '../../../common/forms/InputField'
import {ChangePasswordContainer} from '../ChangePassword'

type fillInFormTypes = {
    component: any,
    currentPwd?: string,
    newPwd?: string,
    confirmNewPwd?: string,
}

const mockChangePassword = jest.fn().mockResolvedValue({
    reason: '',
    error: {},
})

const defaultProps = {
    currentUser: fromJS({}),
    changePassword: mockChangePassword,
}

const INVALID_FEEDBACK_CLASS = '.invalid-feedback'
const OLD_PASSWORD_INPUT_INDEX = 0
const NEW_PASSWORD_INPUT_INDEX = 1
const CONFIRM_NEW_PASSWORD_INPUT_INDEX = 2
const DEFAULT_CURRENT_PWD = 'test1234'
const DEFAULT_NEW_PWD = 'test12345'
const DEFAULT_CONFIRM_PWD = 'test12345'

const fillInForm = ({
    component,
    currentPwd = DEFAULT_CURRENT_PWD,
    newPwd = DEFAULT_NEW_PWD,
    confirmNewPwd = DEFAULT_CONFIRM_PWD,
}: fillInFormTypes) => {
    const current = component
        .find(InputField)
        .at(OLD_PASSWORD_INPUT_INDEX)
        .find('input')
    const newpwd = component
        .find(InputField)
        .at(NEW_PASSWORD_INPUT_INDEX)
        .find('input')
    const confirm = component
        .find(InputField)
        .at(CONFIRM_NEW_PASSWORD_INPUT_INDEX)
        .find('input')

    current.simulate('change', {
        target: {
            value: currentPwd,
        },
    })

    newpwd.simulate('change', {
        target: {
            value: newPwd,
        },
    })

    confirm.simulate('change', {
        target: {
            value: confirmNewPwd,
        },
    })
}

const findConfirmNewPasswordInput = (component: any) =>
    component.find(InputField).at(CONFIRM_NEW_PASSWORD_INPUT_INDEX)

const findNewPasswordInput = (component: any) =>
    component.find(InputField).at(NEW_PASSWORD_INPUT_INDEX)

const findOldPasswordInput = (component: any) =>
    component.find(InputField).at(OLD_PASSWORD_INPUT_INDEX)

beforeEach(() => {
    jest.clearAllMocks()
})

describe('<ChangePassword />', () => {
    describe('render', () => {
        it('should render the password form', () => {
            const component = mount(
                <ChangePasswordContainer {...defaultProps} />
            )
            expect(component).toMatchSnapshot()
        })
    })

    describe('Update fields', () => {
        it('should not display error message when having two identical password', () => {
            const component = mount(
                <ChangePasswordContainer {...defaultProps} />
            )
            fillInForm({component})
            const confirmPasswordValidate = findConfirmNewPasswordInput(
                component
            ).find(INVALID_FEEDBACK_CLASS)

            expect(confirmPasswordValidate).toEqual({})
        })

        it('should display the error message when having two different passwords', () => {
            const component = mount(
                <ChangePasswordContainer {...defaultProps} />
            )
            fillInForm({
                component,
                newPwd: 'test1234',
                confirmNewPwd: 'test12345',
            })
            const confirmPasswordValidate = findConfirmNewPasswordInput(
                component
            ).find(INVALID_FEEDBACK_CLASS)

            expect(confirmPasswordValidate).toExist()
            expect(confirmPasswordValidate.text()).toBe(
                'Passwords do not match.'
            )
        })
    })

    describe('handleSubmit', () => {
        it('should display error below the current password field when submitting the wrong one', (done) => {
            const mockChangePassword = jest.fn().mockResolvedValue({
                reason: 'error',
                error: {
                    response: {
                        data: {
                            error: {
                                data: {
                                    old_password: 'error_generic',
                                },
                            },
                        },
                    },
                },
            })

            const component = mount(
                <ChangePasswordContainer
                    currentUser={fromJS({})}
                    changePassword={mockChangePassword}
                />
            )

            fillInForm({component})
            const form = component.find('form')
            form.simulate('submit')
            setImmediate(() => {
                component.update()
                expect(mockChangePassword).toHaveBeenLastCalledWith(
                    DEFAULT_CURRENT_PWD,
                    DEFAULT_NEW_PWD
                )
                expect(
                    findOldPasswordInput(component).find(INVALID_FEEDBACK_CLASS)
                ).toExist()
                done()
            })
        })

        it('should not disable button if network error', (done) => {
            const mockChangePassword = jest.fn().mockResolvedValue({
                reason: 'error',
                error: {
                    message: 'Network Error',
                },
            })

            const component = mount(
                <ChangePasswordContainer
                    currentUser={fromJS({})}
                    changePassword={mockChangePassword}
                />
            )

            fillInForm({component})
            const form = component.find('form')
            form.simulate('submit')
            setImmediate(() => {
                component.update()
                expect(mockChangePassword).toHaveBeenLastCalledWith(
                    DEFAULT_CURRENT_PWD,
                    DEFAULT_NEW_PWD
                )
                expect(component.find('button').find('.disabled')).not.toExist()
                done()
            })
        })

        it('should empty all the fields when submit successful', (done) => {
            const component = mount(
                <ChangePasswordContainer {...defaultProps} />
            )

            fillInForm({component})
            const form = component.find('form')
            form.simulate('submit')

            setImmediate(() => {
                component.update()
                expect(mockChangePassword).toHaveBeenLastCalledWith(
                    DEFAULT_CURRENT_PWD,
                    DEFAULT_NEW_PWD
                )

                const afterUpdate = {
                    current: findOldPasswordInput(component).find('input'),
                    new: findNewPasswordInput(component).find('input'),
                    confirm: findConfirmNewPasswordInput(component).find(
                        'input'
                    ),
                }

                expect(afterUpdate.current.props().value).toBe('')
                expect(afterUpdate.new.props().value).toBe('')
                expect(afterUpdate.confirm.props().value).toBe('')

                expect(
                    findOldPasswordInput(component).find(INVALID_FEEDBACK_CLASS)
                ).toEqual({})
                done()
            })
        })
    })
})
