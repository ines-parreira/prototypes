import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { history } from '@repo/routing'
import classnames from 'classnames'
import { Col, Form, FormGroup, Row } from 'reactstrap'

import { LegacyBanner as Banner, Button } from '@gorgias/axiom'

import { PhoneUseCase } from 'business/twilio'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    createPhoneNumber,
    fetchNewPhoneNumber,
} from 'models/phoneNumber/resources'
import type {
    AddressInformation,
    PhoneNumber,
    PhoneNumberMeta,
} from 'models/phoneNumber/types'
import { AddressType, PhoneType } from 'models/phoneNumber/types'
import InputField from 'pages/common/forms/input/InputField'
import { newPhoneNumberFetched } from 'state/entities/phoneNumbers/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import useCreatePhoneNumberNotifications from './hooks/useCreatePhoneNumberNotifications'
import { useShowPhoneUseCase } from './hooks/useShowPhoneUseCase'
import PhoneAddressFields from './PhoneAddressFields'
import PhoneMetaFields from './PhoneMetaFields'
import PhoneNumberCapabilitiesAlert from './PhoneNumberCapabilitiesAlert'
import {
    getAddressValidationAlertMessage,
    shouldValidateAddress,
} from './utils'

import css from './PhoneNumberCreateForm.less'

export default function PhoneNumberCreateForm(): JSX.Element {
    const dispatch = useAppDispatch()

    const [name, setName] = useState('')
    const [meta, setMeta] = useState<Partial<PhoneNumberMeta>>({
        type: PhoneType.Local,
        emoji: null,
    })
    const [usecase, setUsecase] = useState<PhoneUseCase>(PhoneUseCase.Standard)
    const { country, type } = meta
    const showUseCase = useShowPhoneUseCase(country)
    const [validationAddress, setValidationAddress] =
        useState<Partial<AddressInformation> | null>(null)

    const { showCreatePhoneNumberErrorNotification } =
        useCreatePhoneNumberNotifications()

    const isAddressValidationRequired =
        country && shouldValidateAddress(country, type)

    const [{ loading: isLoading }, handlePhoneNumberCreate] =
        useAsyncFn(async () => {
            try {
                const address =
                    country && isAddressValidationRequired
                        ? validationAddress
                        : {
                              country,
                              type: AddressType.Company,
                          }
                const payload = {
                    name,
                    meta,
                    address,
                    ...(showUseCase && usecase === PhoneUseCase.Marketing
                        ? { usecase }
                        : {}),
                } as Partial<PhoneNumber>

                const oldPhoneNumber = await createPhoneNumber(payload)
                const phoneNumber = await fetchNewPhoneNumber(
                    oldPhoneNumber.phone_number_id,
                )
                dispatch(newPhoneNumberFetched(phoneNumber))
                void dispatch(
                    notify({
                        message: 'Phone number created successfully.',
                        status: NotificationStatus.Success,
                    }),
                )
                history.push(`/app/settings/phone-numbers/${phoneNumber.id}`)
            } catch (error) {
                showCreatePhoneNumberErrorNotification({ error })
            }
        }, [dispatch, name, meta, validationAddress, showUseCase, usecase])

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            await handlePhoneNumberCreate()
        },
        [handlePhoneNumberCreate],
    )

    useEffect(() => {
        setValidationAddress((address) => ({
            ...address,
            country,
        }))
        setUsecase(PhoneUseCase.Standard)
    }, [country])

    const validationAlertMessage = getAddressValidationAlertMessage(
        country,
        type,
    )

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
                    {country && (
                        <PhoneNumberCapabilitiesAlert
                            country={country}
                            type={type}
                        />
                    )}
                    {validationAlertMessage && (
                        <Banner className="mt-3 mb-4">
                            {validationAlertMessage}
                        </Banner>
                    )}
                    <Form onSubmit={onSubmit}>
                        <FormGroup>
                            {country && isAddressValidationRequired && (
                                <h4 className="mb-3">Phone number settings</h4>
                            )}
                            <InputField
                                label="Phone number name"
                                placeholder="Ex: Company Support Line"
                                value={name}
                                onChange={setName}
                                isRequired
                            />
                        </FormGroup>
                        <PhoneMetaFields
                            value={meta}
                            onChange={setMeta}
                            usecase={usecase}
                            onUseCaseChange={setUsecase}
                            showUseCase={showUseCase}
                        />
                        {validationAddress &&
                            country &&
                            isAddressValidationRequired && (
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
                            isDisabled={!!validationAlertMessage}
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
