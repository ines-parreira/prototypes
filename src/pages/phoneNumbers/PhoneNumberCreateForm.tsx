import React, {useCallback, useState, useEffect} from 'react'
import classnames from 'classnames'
import {Col, Form, FormGroup, Row} from 'reactstrap'
import {useAsyncFn} from 'react-use'
import {AxiosError} from 'axios'

import InputField from 'pages/common/forms/input/InputField'
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
import Button from 'pages/common/components/button/Button'

import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'
import PhoneAddressFields from './PhoneAddressFields'
import PhoneMetaFields from './PhoneMetaFields'
import PhoneNumberCapabilitiesAlert from './PhoneNumberCapabilitiesAlert'
import PhoneNumberAddressValidationAlert from './PhoneNumberAddressValidationAlert'
import {shouldValidateAddress} from './utils'
import css from './PhoneNumberCreateForm.less'

export default function PhoneNumberCreateForm(): JSX.Element {
    const dispatch = useAppDispatch()

    const [name, setName] = useState('')
    const [meta, setMeta] = useState<Partial<PhoneNumberMeta>>({
        type: PhoneType.Local,
        emoji: null,
    })
    const {country, type} = meta
    const [address, setAddress] = useState<Partial<AddressInformation> | null>({
        country,
        type: AddressType.Company,
    })

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
                        Create a new phone number in Gorgias to make and receive
                        phone calls and text messages. If you have an existing
                        number, set up call forwarding to forward calls to a
                        Gorgias internal number. Check out our{' '}
                        <a
                            href="https://docs.gorgias.com/en-US/phone-integration-81798"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            phone docs
                        </a>{' '}
                        to learn more.
                    </p>
                </Col>
            </Row>
            <Row>
                <Col lg={6} xl={7}>
                    {country && type && (
                        <PhoneNumberCapabilitiesAlert
                            country={country}
                            type={type}
                        />
                    )}
                    <PhoneNumberAddressValidationAlert country={country} />
                    <Form onSubmit={onSubmit}>
                        <FormGroup>
                            {country && shouldValidateAddress(country) && (
                                <h4 className="mb-3">Phone number settings</h4>
                            )}
                            <InputField
                                label="Title"
                                placeholder="Ex: Company Support Line"
                                value={name}
                                onChange={setName}
                                isRequired
                            />
                        </FormGroup>
                        <PhoneMetaFields value={meta} onChange={setMeta} />
                        {address && country && shouldValidateAddress(country) && (
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
                            className={classnames('mt-4', 'mb-4')}
                        >
                            Add phone number
                        </Button>
                    </Form>
                </Col>
            </Row>
        </>
    )
}
