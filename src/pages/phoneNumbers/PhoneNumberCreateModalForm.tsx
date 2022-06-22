import React, {useCallback, useState, useEffect, useMemo} from 'react'
import {Col, Form, FormGroup, Row} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import {
    PhoneNumber,
    PhoneNumberMeta,
    AddressInformation,
    AddressType,
    PhoneCountry,
    PhoneType,
} from 'models/phoneNumber/types'
import {createPhoneNumber} from 'models/phoneNumber/resources'
import {GorgiasApiError} from 'models/api/types'
import {phoneNumberCreated} from 'state/entities/phoneNumbers/actions'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import Button from 'pages/common/components/button/Button'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import useAppDispatch from 'hooks/useAppDispatch'
import {errorToChildren} from 'utils'

import PhoneNumberCapabilitiesAlert from './PhoneNumberCapabilitiesAlert'
import PhoneNumberAddressValidationAlert from './PhoneNumberAddressValidationAlert'
import PhoneAddressFields from './PhoneAddressFields'
import PhoneMetaFields from './PhoneMetaFields'
import {shouldValidateAddress} from './utils'

type Props = {
    isOpen: boolean
    onClose: () => void
    onCreate: (phoneNumber: PhoneNumber) => void
}

enum Step {
    PhoneInformation,
    AddressVerfication,
}

export default function PhoneNumberCreateModalForm({
    isOpen,
    onClose,
    onCreate,
}: Props): JSX.Element {
    const dispatch = useAppDispatch()
    const [step, setStep] = useState<Step>(Step.PhoneInformation)
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
                onClose()
                onCreate(phoneNumber)
            } catch (error) {
                const errors = errorToChildren(error)
                const title =
                    (error as GorgiasApiError).response.data.error.msg ??
                    'Failed to create phone number'
                void dispatch(
                    notify({
                        title,
                        message: errors ?? '',
                        status: NotificationStatus.Error,
                        allowHTML: true,
                    })
                )
            }
        }, [dispatch, name, meta, address, onClose, onCreate])

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            event.stopPropagation()
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

    const footerExtra = useMemo(() => {
        if (country && shouldValidateAddress(country)) {
            if (step === Step.PhoneInformation) {
                return 'Step 1 of 2 - Phone Information'
            } else if (step === Step.AddressVerfication) {
                return 'Step 2 of 2 - Address Verification'
            }
            return null
        }
        return null
    }, [country, step])

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader title="Create Phone Number" />
            <Form onSubmit={onSubmit}>
                <ModalBody>
                    <Row>
                        <Col>
                            {country && type && (
                                <PhoneNumberCapabilitiesAlert
                                    country={country}
                                    type={type}
                                />
                            )}
                            <PhoneNumberAddressValidationAlert
                                country={country}
                            />
                            {step === Step.PhoneInformation && (
                                <>
                                    <FormGroup>
                                        <DEPRECATED_InputField
                                            label="Title"
                                            placeholder="Ex: Company Support Line"
                                            value={name}
                                            onChange={setName}
                                            required
                                        />
                                    </FormGroup>
                                    <PhoneMetaFields
                                        value={meta}
                                        onChange={setMeta}
                                    />
                                </>
                            )}
                            {step === Step.AddressVerfication &&
                                address &&
                                country &&
                                shouldValidateAddress(country) && (
                                    <PhoneAddressFields
                                        value={address}
                                        onChange={setAddress}
                                    />
                                )}
                        </Col>
                    </Row>
                </ModalBody>
                <ModalActionsFooter extra={footerExtra}>
                    <>
                        {country && shouldValidateAddress(country) && (
                            <>
                                {step === Step.PhoneInformation && (
                                    <Button
                                        onClick={() =>
                                            setStep(Step.AddressVerfication)
                                        }
                                    >
                                        Next
                                    </Button>
                                )}
                                {step === Step.AddressVerfication && (
                                    <>
                                        <Button
                                            className="mr-2"
                                            intent="secondary"
                                            onClick={() =>
                                                setStep(Step.PhoneInformation)
                                            }
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            isDisabled={
                                                country === PhoneCountry.FR
                                            }
                                            isLoading={isLoading}
                                            onClick={onSubmit}
                                        >
                                            Create phone number
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                        {(!country || !shouldValidateAddress(country)) && (
                            <Button
                                isDisabled={country === PhoneCountry.FR}
                                isLoading={isLoading}
                                onClick={onSubmit}
                            >
                                Create phone number
                            </Button>
                        )}
                    </>
                </ModalActionsFooter>
            </Form>
        </Modal>
    )
}
