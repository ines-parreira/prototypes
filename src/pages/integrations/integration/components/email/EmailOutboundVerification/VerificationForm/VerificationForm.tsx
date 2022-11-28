import React, {useState} from 'react'
import {Form, FormGroup, Label} from 'reactstrap'
import classNames from 'classnames'
import {useAsyncFn} from 'react-use'
import {AxiosError} from 'axios'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Button from 'pages/common/components/button/Button'
import {states} from 'fixtures/states'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {createVerification} from 'models/singleSenderVerification/resources'
import {setVerification} from 'state/entities/singleSenderVerification/actions'
import {SenderInformation} from 'models/singleSenderVerification/types'

import css from './VerificationForm.less'

type InitialValues = {
    email: string
    address?: string
    city?: string
    country?: string
}

export type Props = {
    isFormDisabled?: boolean
    initialValues: InitialValues
    id?: number
    onVerificationUpdate?: () => void
}

export default function VerificationForm({
    isFormDisabled,
    initialValues,
    id,
    onVerificationUpdate,
}: Props) {
    const [address, setAddress] = useState(initialValues.address ?? '')
    const [city, setCity] = useState(initialValues.city ?? '')
    const [country, setCountry] = useState(initialValues.country ?? '')

    const dispatch = useAppDispatch()

    const {email} = initialValues

    const [{loading: isLoading}, handleVerificationCreate] =
        useAsyncFn(async () => {
            if (!id) return

            try {
                const payload: SenderInformation = {
                    address,
                    city,
                    country,
                    email,
                }

                const verification = await createVerification(id, payload)
                onVerificationUpdate?.()
                dispatch(setVerification(verification))
                void dispatch(
                    notify({
                        message: 'Verification created successfully',
                        status: NotificationStatus.Success,
                    })
                )
            } catch (error) {
                const {response} = error as AxiosError<{error: {msg: string}}>
                const errorMsg =
                    response && response.data.error
                        ? response.data.error.msg
                        : 'Failed to create verification'

                void dispatch(
                    notify({
                        message: errorMsg,
                        status: NotificationStatus.Error,
                    })
                )
            }
        }, [dispatch, email, city, country, address, id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await handleVerificationCreate()
    }

    return (
        <Form
            onSubmit={handleSubmit}
            data-testid={`verification-form-${
                isFormDisabled ? 'disabled' : 'enabled'
            }`}
        >
            <FormGroup>
                <InputField
                    id="email"
                    label="Email address"
                    isDisabled
                    isRequired={false}
                    value={email}
                />
            </FormGroup>
            <FormGroup>
                <InputField
                    id="address"
                    label="Address"
                    placeholder="Street address, apartment, suite etc."
                    value={address}
                    isRequired={!isFormDisabled}
                    isDisabled={isFormDisabled}
                    onChange={setAddress}
                />
            </FormGroup>
            <div className="d-flex align-items-center">
                <FormGroup className={css.halfWidth}>
                    <InputField
                        id="city"
                        label="City"
                        placeholder=""
                        value={city}
                        onChange={setCity}
                        isRequired={!isFormDisabled}
                        isDisabled={isFormDisabled}
                    />
                </FormGroup>
                <FormGroup className={classNames('ml-4', css.halfWidth)}>
                    <Label
                        htmlFor="country"
                        className={classNames('control-label', {
                            [css.required]: !isFormDisabled,
                            [css.isDisabled]: isFormDisabled,
                        })}
                    >
                        Country
                    </Label>
                    <SelectField
                        id="country"
                        options={states.map((option) => ({
                            value: option.name,
                            label: option.name,
                        }))}
                        value={country}
                        onChange={(country) => setCountry(country as string)}
                        fullWidth
                        required={!isFormDisabled}
                        disabled={isFormDisabled}
                    />
                </FormGroup>
            </div>
            {!isFormDisabled && (
                <Button type="submit" className="mt-4" isLoading={isLoading}>
                    Submit
                </Button>
            )}
        </Form>
    )
}
