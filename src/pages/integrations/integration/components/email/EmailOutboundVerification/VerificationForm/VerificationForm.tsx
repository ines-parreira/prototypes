import classNames from 'classnames'
import React, {useState} from 'react'
import {Form, FormGroup, Label} from 'reactstrap'

import {states} from 'config/states'
import {states as countries} from 'fixtures/states'
import {SenderInformation} from 'models/singleSenderVerification/types'
import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import css from './VerificationForm.less'

type InitialValues = {
    email?: string
    address?: string
    city?: string
    country?: string
    state?: string
    zip?: string
}

export type Props = {
    isFormDisabled?: boolean
    isLoading?: boolean
    showSubmitButton?: boolean
    initialValues?: InitialValues
    onSubmit?: (values: SenderInformation) => void
}

export const FORM_ID = 'single-sender-verification-form'

export default function VerificationForm({
    isFormDisabled,
    isLoading,
    showSubmitButton,
    initialValues = {},
    onSubmit,
}: Props) {
    const [address, setAddress] = useState(initialValues.address ?? '')
    const [city, setCity] = useState(initialValues.city ?? '')
    const [country, setCountry] = useState(initialValues.country ?? '')
    const [stateValue, setStateValue] = useState(initialValues.state ?? '')
    const [zip, setZip] = useState(initialValues.zip ?? '')

    const {email} = initialValues

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit?.({
            address,
            city,
            country,
            email: email ?? '',
            state: stateValue,
            zip,
        })
    }

    const handleCountryChange = (country: string) => {
        setCountry(country)
        setStateValue('')
    }

    const isStateFieldVisible = country === 'United States'

    return (
        <Form
            onSubmit={handleSubmit}
            data-testid={`verification-form-${
                isFormDisabled ? 'disabled' : 'enabled'
            }`}
            id={FORM_ID}
        >
            {email && (
                <FormGroup>
                    <InputField
                        id="email"
                        label="Email address"
                        isDisabled
                        isRequired={false}
                        value={email}
                    />
                </FormGroup>
            )}
            <FormGroup>
                <InputField
                    id="address"
                    label="Address"
                    placeholder="Street address, apartment, suite etc."
                    value={address}
                    isRequired={!isFormDisabled}
                    isDisabled={isFormDisabled}
                    onChange={setAddress}
                    maxLength={100}
                />
            </FormGroup>
            <div className={css.fieldGroupsWrapper}>
                <FormGroup className={css.halfWidth}>
                    <InputField
                        id="city"
                        label="City"
                        placeholder=""
                        value={city}
                        onChange={setCity}
                        isRequired={!isFormDisabled}
                        isDisabled={isFormDisabled}
                        maxLength={150}
                    />
                </FormGroup>
                <FormGroup className={classNames(css.halfWidth)}>
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
                        options={countries.map((option) => ({
                            value: option.name,
                            label: option.name,
                        }))}
                        value={country}
                        onChange={(country) =>
                            handleCountryChange(country as string)
                        }
                        fullWidth
                        required={!isFormDisabled}
                        disabled={isFormDisabled}
                    />
                </FormGroup>
            </div>
            <div className={css.fieldGroupsWrapper}>
                {isStateFieldVisible && (
                    <FormGroup className={css.halfWidth}>
                        <Label
                            htmlFor="state"
                            className={classNames('control-label', {
                                [css.isDisabled]: isFormDisabled,
                            })}
                        >
                            State
                        </Label>
                        <SelectField
                            className={css.inputRow}
                            id="state"
                            fullWidth
                            options={states['US'].map((state) => ({
                                label: state.name,
                                value: state.code,
                            }))}
                            onChange={(state) => setStateValue(state as string)}
                            value={stateValue}
                            disabled={isFormDisabled}
                        />
                    </FormGroup>
                )}
                <FormGroup className={css.halfWidth}>
                    <InputField
                        className={css.inputRow}
                        label="Zip Code"
                        id="zip"
                        onChange={setZip}
                        value={zip}
                        isDisabled={isFormDisabled}
                        maxLength={10}
                    />
                </FormGroup>
            </div>
            {showSubmitButton && (
                <Button type="submit" className="mt-4" isLoading={isLoading}>
                    Submit
                </Button>
            )}
        </Form>
    )
}
