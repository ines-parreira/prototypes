import React, {useCallback, useState, useEffect} from 'react'
import classnames from 'classnames'
import {Col, Form, FormGroup, Row} from 'reactstrap'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useAsyncFn} from 'react-use'

import InputField from 'pages/common/forms/input/InputField'
import {
    PhoneNumber,
    PhoneNumberMeta,
    AddressInformation,
    AddressType,
    PhoneCountry,
    PhoneType,
} from 'models/phoneNumber/types'
import {
    createPhoneNumber,
    fetchNewPhoneNumber,
} from 'models/phoneNumber/resources'
import {newPhoneNumberFetched} from 'state/entities/phoneNumbers/actions'
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
import useCreatePhoneNumberNotifications from './hooks/useCreatePhoneNumberNotifications'
import css from './PhoneNumberCreateForm.less'

export default function PhoneNumberCreateForm(): JSX.Element {
    const dispatch = useAppDispatch()

    const [name, setName] = useState('')
    const [meta, setMeta] = useState<Partial<PhoneNumberMeta>>({
        type: PhoneType.Local,
        emoji: null,
    })
    const {country, type} = meta
    const [validationAddress, setValidationAddress] =
        useState<Partial<AddressInformation> | null>(null)

    const {showCreatePhoneNumberErrorNotification} =
        useCreatePhoneNumberNotifications()

    const [{loading: isLoading}, handlePhoneNumberCreate] =
        useAsyncFn(async () => {
            try {
                const address =
                    country && shouldValidateAddress(country)
                        ? validationAddress
                        : {
                              country,
                              type: AddressType.Company,
                          }
                const payload = {
                    name,
                    meta,
                    address,
                } as Partial<PhoneNumber>

                const oldPhoneNumber = await createPhoneNumber(payload)
                const phoneNumber = await fetchNewPhoneNumber(
                    oldPhoneNumber.phone_number_id
                )
                dispatch(newPhoneNumberFetched(phoneNumber))
                void dispatch(
                    notify({
                        message: 'Phone number created successfully.',
                        status: NotificationStatus.Success,
                    })
                )
                history.push(`/app/settings/phone-numbers/${phoneNumber.id}`)
            } catch (error) {
                showCreatePhoneNumberErrorNotification({error})
            }
        }, [dispatch, name, meta, validationAddress])

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            await handlePhoneNumberCreate()
        },
        [handlePhoneNumberCreate]
    )

    useEffect(() => {
        setValidationAddress((address) => ({
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
                        {validationAddress &&
                            country &&
                            shouldValidateAddress(country) && (
                                <div className={css.addressWrapper}>
                                    <h4 className="mb-3">
                                        Address verification
                                    </h4>
                                    <PhoneAddressFields
                                        value={validationAddress}
                                        onChange={setValidationAddress}
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
