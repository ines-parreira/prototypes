import React, {useMemo, useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Form, Button, Container} from 'reactstrap'
import {AxiosError} from 'axios'

import InputField from 'pages/common/forms/InputField'

import {changePassword} from '../../../state/currentUser/actions'
import PageHeader from '../../common/components/PageHeader'
import {RootState} from '../../../state/types'
import css from '../settings.less'

type Errors = {
    old_password?: string
    new_password?: string
    confirm_new_password?: string
}

const VALIDATE_PASSWORD_ERROR_MESSAGE = 'Passwords do not match.'
const USER_PASSWORD_MIN_LENGTH = 14
const USER_PASSWORD_MAX_LENGTH = 128
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

    const [, handleSubmit] = useAsyncFn(async () => {
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
    }, [oldPassword, newPassword])

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
        setErrors(errors)
    }, [newPassword, confirmNewPassword])

    return (
        <div className="full-width">
            <PageHeader title="Change password" />
            <Container fluid className={css.pageContainer}>
                <div className={css.contentWrapper}>
                    <div
                        className={classnames(css['heading-regular'], css.mb32)}
                    >
                        Enter your current password to confirm your identity,
                        then the new password you would like to set instead.
                    </div>

                    <Form
                        onSubmit={(event) => {
                            event.preventDefault()
                            void handleSubmit()
                        }}
                    >
                        <InputField
                            type="password"
                            name="old_password"
                            label="Current password"
                            placeholder="Current password"
                            required
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
                            className={css.inputField}
                        />
                        <InputField
                            type="password"
                            name="new_password"
                            label="New password"
                            placeholder="New password"
                            pattern={USER_PASSWORD_VALIDATION_PATTERN}
                            title={`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long and contain at least 1 lower case letter, 1 upper case letter and 1 digit.`}
                            required
                            value={newPassword}
                            onChange={(value) => {
                                setDirty(true)
                                setNewPassword(value)
                            }}
                            error={errors.new_password}
                            className={css.inputField}
                        />
                        <InputField
                            type="password"
                            name="confirm_new_password"
                            label="Confirm new password"
                            placeholder="Confirm new password"
                            pattern={USER_PASSWORD_VALIDATION_PATTERN}
                            title={`Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters long and contain at least 1 lower case letter, 1 upper case letter and 1 digit.`}
                            required
                            value={confirmNewPassword}
                            onChange={(value) => {
                                setDirty(true)
                                setConfirmNewPassword(value)
                            }}
                            error={errors.confirm_new_password}
                            className={classnames(css.inputField, css.mb40)}
                        />

                        <Button
                            type="submit"
                            color="success"
                            className={classnames({
                                'btn-loading': isLoading,
                            })}
                            disabled={isLoading || invalid || !dirty}
                        >
                            Update Password
                        </Button>
                    </Form>
                </div>
            </Container>
        </div>
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
