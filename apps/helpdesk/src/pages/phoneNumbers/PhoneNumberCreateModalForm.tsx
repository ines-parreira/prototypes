import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { Col, Form, FormGroup, Row } from 'reactstrap'

import { LegacyBanner as Banner, LegacyButton as Button } from '@gorgias/axiom'

import { PhoneUseCase } from 'business/twilio'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    createPhoneNumber,
    fetchNewPhoneNumber,
} from 'models/phoneNumber/resources'
import type {
    AddressInformation,
    NewPhoneNumber,
    PhoneNumberMeta,
} from 'models/phoneNumber/types'
import { AddressType, PhoneType } from 'models/phoneNumber/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
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

type Props = {
    isOpen: boolean
    onClose: () => void
    onCreate: (phoneNumber: NewPhoneNumber) => void
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
    const { showCreatePhoneNumberErrorNotification } =
        useCreatePhoneNumberNotifications()

    const [step, setStep] = useState<Step>(Step.PhoneInformation)
    const [name, setName] = useState('')
    const [meta, setMeta] = useState<Partial<PhoneNumberMeta>>({
        type: PhoneType.Local,
        emoji: null,
    })
    const [usecase, setUsecase] = useState<PhoneUseCase>(PhoneUseCase.Standard)
    const { country, type } = meta
    const showUseCase = useShowPhoneUseCase(country)

    const [address, setAddress] = useState<Partial<AddressInformation> | null>({
        country,
        type: AddressType.Company,
    })

    const isAddressValidationRequired = useMemo(
        () => country && shouldValidateAddress(country, type),
        [country, type],
    )

    const [{ loading: isLoading }, handlePhoneNumberCreate] =
        useAsyncFn(async () => {
            try {
                const payload = {
                    name,
                    meta,
                    address,
                    ...(showUseCase && usecase === PhoneUseCase.Marketing
                        ? { usecase }
                        : {}),
                } as Partial<NewPhoneNumber>

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
                onClose()
                onCreate(phoneNumber)
            } catch (error) {
                showCreatePhoneNumberErrorNotification({ error })
            }
        }, [
            dispatch,
            name,
            meta,
            address,
            onClose,
            onCreate,
            showUseCase,
            usecase,
        ])

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            event.stopPropagation()
            await handlePhoneNumberCreate()
        },
        [handlePhoneNumberCreate],
    )

    useEffect(() => {
        setAddress((address) => ({
            ...address,
            country,
        }))
        setUsecase(PhoneUseCase.Standard)
    }, [country])

    const footerExtra = useMemo(() => {
        if (country && isAddressValidationRequired) {
            if (step === Step.PhoneInformation) {
                return 'Step 1 of 2 - Phone Information'
            } else if (step === Step.AddressVerfication) {
                return 'Step 2 of 2 - Address Verification'
            }
            return null
        }
        return null
    }, [country, isAddressValidationRequired, step])

    const validationAlertMessage = getAddressValidationAlertMessage(
        country,
        type,
    )

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
                            {validationAlertMessage && (
                                <Banner className="mt-3 mb-4">
                                    {validationAlertMessage}
                                </Banner>
                            )}
                            {step === Step.PhoneInformation && (
                                <>
                                    <FormGroup>
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
                                </>
                            )}
                            {step === Step.AddressVerfication &&
                                address &&
                                country &&
                                isAddressValidationRequired && (
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
                        {country && isAddressValidationRequired && (
                            <>
                                {step === Step.PhoneInformation && (
                                    <Button
                                        isDisabled={!!validationAlertMessage}
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
                                                !!validationAlertMessage
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
                        {(!country || !isAddressValidationRequired) && (
                            <Button
                                isDisabled={!!validationAlertMessage}
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
