import React, {useCallback, useState, useEffect} from 'react'
import {Col, Form, FormGroup, Label, Row} from 'reactstrap'
import {useAsyncFn} from 'react-use'
import {AxiosError} from 'axios'

import {
    PhoneNumber,
    PhoneNumberMeta,
    AddressInformation,
    AddressType,
    PhoneCountry,
    PhoneType,
} from 'models/phoneNumber/types'
import {createPhoneNumber} from 'models/phoneNumber/resources'
import {phoneNumberCreated} from 'state/entities/phoneNumbers/actions'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import Alert from 'pages/common/components/Alert/Alert'
import InputField from 'pages/common/forms/InputField'
import Button from 'pages/common/components/button/Button'

import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'
import PhoneAddressFields from './PhoneAddressFields'
import PhoneMetaFields from './PhoneMetaFields'

import css from './PhoneNumberCreateForm.less'

export default function PhoneNumberCreateForm(): JSX.Element {
    const dispatch = useAppDispatch()

    const [name, setName] = useState('')
    const [meta, setMeta] = useState<Partial<PhoneNumberMeta>>({
        type: PhoneType.Local,
        emoji: null,
    })
    const {country} = meta
    const [address, setAddress] = useState<Partial<AddressInformation> | null>({
        country,
        type: AddressType.Company,
    })
    const shouldValidateAddress = useCallback(
        (country) =>
            country === PhoneCountry.GB ||
            country === PhoneCountry.AU ||
            country === PhoneCountry.FR,
        []
    )

    const [{loading: isLoading}, handlePhoneNumberCreate] =
        useAsyncFn(async () => {
            try {
                const payload = {
                    name,
                    meta,
                    address,
                } as Partial<PhoneNumber>

                const phoneNumber = await createPhoneNumber(payload)
                dispatch(phoneNumberCreated(phoneNumber))
                void dispatch(
                    notify({
                        message: 'Phone number created successfully.',
                        status: NotificationStatus.Success,
                    })
                )
                history.push(`/app/settings/phone-numbers/${phoneNumber.id}`)
            } catch (error) {
                const {response} = error as AxiosError<{error: {msg: string}}>
                const errorMsg =
                    response && response.data.error
                        ? response.data.error.msg
                        : 'Failed to create phone number'

                void dispatch(
                    notify({
                        message: errorMsg,
                        status: NotificationStatus.Error,
                    })
                )
            }
        }, [dispatch, name, meta, address])

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            await handlePhoneNumberCreate()
        },
        [handlePhoneNumberCreate]
    )

    useEffect(() => {
        setAddress((address) => ({
            ...address,
            country,
        }))
    }, [country])

    return (
        <>
            <Row>
                <Col lg={6}>
                    <p>
                        Create a new phone number in Gorgias or forward calls
                        from an existing number to a Gorgias internal number. To
                        learn more about forwarding existing calls, check out{' '}
                        <a
                            href="https://docs.gorgias.com/voice-and-phone/gorgias-phone-integration"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            our phone docs
                        </a>
                        .
                    </p>
                </Col>
            </Row>
            <Row>
                <Col lg={6} xl={7}>
                    {shouldValidateAddress(country) &&
                        country === PhoneCountry.FR && (
                            <Alert icon className="mt-3 mb-4">
                                French numbers are only available through the{' '}
                                <a
                                    href="https://gorgias.typeform.com/to/YhvfA3qK"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    French number request form.
                                </a>
                            </Alert>
                        )}
                    {shouldValidateAddress(country) &&
                        country !== PhoneCountry.FR && (
                            <Alert icon className="mt-3 mb-4">
                                Creating phone numbers from Australia and UK
                                requires address verification
                            </Alert>
                        )}
                    <Form onSubmit={onSubmit}>
                        <FormGroup>
                            {shouldValidateAddress(country) && (
                                <h4 className="mb-3">Phone number settings</h4>
                            )}
                            <Label htmlFor="type" className="control-label">
                                Title
                            </Label>
                            <InputField
                                placeholder="Ex: Company Support Line"
                                value={name}
                                onChange={setName}
                                required
                            />
                        </FormGroup>
                        <PhoneMetaFields value={meta} onChange={setMeta} />
                        {address && shouldValidateAddress(country) && (
                            <div className={css.addressWrapper}>
                                <h4 className="mb-3">Address verification</h4>
                                <PhoneAddressFields
                                    value={address}
                                    onChange={setAddress}
                                />
                            </div>
                        )}
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            isDisabled={country === PhoneCountry.FR}
                        >
                            Add phone number
                        </Button>
                    </Form>
                </Col>
            </Row>
        </>
    )
}
