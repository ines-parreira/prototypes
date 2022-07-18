import React, {useMemo, useEffect, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Form} from 'reactstrap'
import {AxiosError} from 'axios'

import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/input/InputField'
import settingsCss from 'pages/settings/settings.less'
import {changePassword} from 'state/currentUser/actions'
import {RootState} from 'state/types'

import css from './ChangePassword.less'

type Errors = {
    old_password?: string
    new_password?: string
    confirm_new_password?: string
}

const USER_PASSWORD_MIN_LENGTH = 14
const USER_PASSWORD_MAX_LENGTH = 128
const VALIDATE_PASSWORD_ERROR_MESSAGE = 'Passwords do not match.'
const INVALID_PASSWORD_FORMAT_ERROR_MESSAGE = `A password must contain a minimum of ${USER_PASSWORD_MIN_LENGTH} characters, 1 lower case, 1 upper case and 1 number.`
const REQUIRED_PASSWORD_ERROR_MESSAGE = 'Please fill out this field.'

const USER_PASSWORD_VALIDATION_PATTERN = `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{${USER_PASSWORD_MIN_LENGTH},${USER_PASSWORD_MAX_LENGTH}}$`

export const ChangePasswordContainer = ({
    currentUser,
    changePassword,
}: ConnectedProps<typeof connector>) => {
    const isLoading = currentUser.getIn(['_internal', 'loading', 'currentUser'])
    const [dirty, setDirty] = useState(true)
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [errors, setErrors] = useState<Errors>({})

    const handleSubmit = async () => {
        if (!oldPassword) {
            errors.old_password = REQUIRED_PASSWORD_ERROR_MESSAGE
        }
        if (!newPassword) {
            errors.new_password = REQUIRED_PASSWORD_ERROR_MESSAGE
        }
        if (!confirmNewPassword) {
            errors.confirm_new_password = REQUIRED_PASSWORD_ERROR_MESSAGE
        }

        if (Object.keys(errors).length) {
            setErrors(errors)
            setDirty(false)

            return
        }

        const result = (await changePassword(oldPassword, newPassword)) as {
            reason?: string
            error?: AxiosError<{error: {data?: Errors}}>
        }

        // This is always populated if there's an error
        // if there's an http error we don't get back result.error.response.data.error.data
        const isError = !!result?.reason && result.reason.length > 0

        setErrors({
            ...(result?.error?.response?.data?.error?.data || {}),
        })

        if (!isError) {
            setOldPassword('')
            setNewPassword('')
            setConfirmNewPassword('')
        } else if (result.error?.message !== 'Network Error') {
            setDirty(false)
        }
    }

    const invalid = useMemo(() => Object.keys(errors).length > 0, [errors])

    useEffect(() => {
        const errors: Errors = {}
        if (
            newPassword &&
            confirmNewPassword &&
            newPassword !== confirmNewPassword
        ) {
            errors.confirm_new_password = VALIDATE_PASSWORD_ERROR_MESSAGE
        }
        if (
            newPassword &&
            !newPassword.match(USER_PASSWORD_VALIDATION_PATTERN)
        ) {
            errors.new_password = INVALID_PASSWORD_FORMAT_ERROR_MESSAGE
        }
        setErrors(errors)
    }, [newPassword, confirmNewPassword])

    return (
        <>
            <div
                className={classnames(
                    'heading-subsection-semibold',
                    settingsCss.inputField
                )}
            >
                Update password
            </div>

            <Form
                onSubmit={(event) => {
                    event.preventDefault()
                    void handleSubmit()
                }}
                noValidate
            >
                <InputField
                    type="password"
                    id="old_password"
                    name="old_password"
                    label="Current password"
                    isRequired
                    value={oldPassword}
                    onChange={(value) => {
                        const updatedErrors = {
                            ...errors,
                        }
                        delete updatedErrors['old_password']
                        setDirty(true)
                        setErrors(updatedErrors)
                        setOldPassword(value)
                    }}
                    error={errors.old_password}
                    className={settingsCss.inputField}
                />
                <InputField
                    type="password"
                    id="new_password"
                    name="new_password"
                    label="New password"
                    pattern={USER_PASSWORD_VALIDATION_PATTERN}
                    caption={
                        !errors.new_password && (
                            <span>
                                {`A password must contain a minimum of ${USER_PASSWORD_MIN_LENGTH} characters, 1 lower case, 1 upper case and 1 number.`}
                            </span>
                        )
                    }
                    isRequired
                    value={newPassword}
                    onChange={(value) => {
                        setDirty(true)
                        setNewPassword(value)
                    }}
                    error={errors.new_password}
                    className={settingsCss.inputField}
                />
                <InputField
                    type="password"
                    id="confirm_new_password"
                    name="confirm_new_password"
                    label="Confirm new password"
                    pattern={USER_PASSWORD_VALIDATION_PATTERN}
                    isRequired
                    value={confirmNewPassword}
                    onChange={(value) => {
                        setDirty(true)
                        setConfirmNewPassword(value)
                    }}
                    error={errors.confirm_new_password}
                    className={settingsCss.inputField}
                />

                <Button
                    type="submit"
                    className={css.updatePasswordButton}
                    isDisabled={invalid || !dirty}
                    isLoading={isLoading}
                >
                    Update Password
                </Button>
            </Form>
        </>
    )
}

const connector = connect(
    (state: RootState) => ({
        currentUser: state.currentUser,
    }),
    {
        changePassword,
    }
)

export default connector(ChangePasswordContainer)
