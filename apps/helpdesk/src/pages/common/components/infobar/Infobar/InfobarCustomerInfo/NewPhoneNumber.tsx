import { useState } from 'react'

import { isValidPhoneNumber } from 'libphonenumber-js'

import { LegacyButton as Button } from '@gorgias/axiom'
import {
    LegacyChannelSlug,
    UpdateCustomerBodyChannelsItem,
    useGetCustomer,
    useUpdateCustomer,
} from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import SourceIcon from 'pages/common/components/SourceIcon'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import { SUBMIT_CUSTOMER_SUCCESS } from 'state/customers/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './CustomerChannels.less'

type Props = {
    customerId: number
}

export default function NewPhoneNumber({ customerId }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [error, setError] = useState<string>()

    const handleModalClose = () => {
        setIsModalOpen(false)
        setPhoneNumber('')
        setError(undefined)
    }

    const {
        data: customerDetails,
        isLoading: isCustomerDetailsLoading,
        refetch: refetchCustomerDetails,
    } = useGetCustomer(customerId, undefined, {
        query: {
            refetchOnWindowFocus: false,
        },
    })

    const { mutate: updateCustomer, isLoading } = useUpdateCustomer({
        mutation: {
            onError: (error: {
                response?: {
                    data?: {
                        error?: {
                            data?: { channels?: { _schema?: string[] }[] }
                        }
                    }
                }
            }) => {
                const customerChannelsLength =
                    customerDetails?.data?.channels?.length ?? 0
                const phoneNumberError =
                    error.response?.data?.error?.data?.channels?.[
                        customerChannelsLength
                    ]?._schema?.[0]

                void dispatch(
                    notify({
                        message:
                            phoneNumberError ?? `Failed to update customer`,
                        status: NotificationStatus.Error,
                    }),
                )
            },
            onSuccess: (response) => {
                void dispatch(
                    notify({
                        message: `Phone number added to customer`,
                        status: NotificationStatus.Success,
                    }),
                )
                dispatch({
                    type: SUBMIT_CUSTOMER_SUCCESS,
                    isUpdate: true,
                    resp: response.data,
                })
                void refetchCustomerDetails()
                handleModalClose()
            },
        },
    })

    const dispatch = useAppDispatch()

    const handleConfirmClick = () => {
        if (!isValidPhoneNumber(phoneNumber)) {
            setError('Enter a valid number')
            return
        }

        updateCustomer({
            id: customerId,
            data: {
                channels: [
                    ...((customerDetails?.data
                        ?.channels as UpdateCustomerBodyChannelsItem[]) || []),
                    {
                        type: LegacyChannelSlug.Phone,
                        address: phoneNumber,
                        preferred: false,
                    },
                ],
            },
        })
    }

    const handlePhoneNumberChange = (value: string) => {
        setPhoneNumber(value)
        setError(undefined)
    }

    if (isCustomerDetailsLoading || !customerDetails) {
        return null
    }

    return (
        <>
            <div className={css.customerChannel}>
                <SourceIcon
                    type={LegacyChannelSlug.Phone}
                    className={`${css.channelIcon} uncolored mr-2`}
                />
                <a href="#" onClick={() => setIsModalOpen(true)}>
                    Add phone number
                </a>
            </div>
            <Modal size="small" isOpen={isModalOpen} onClose={handleModalClose}>
                <ModalHeader title="Add phone number" />
                <ModalBody>
                    <PhoneNumberInput
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        error={error}
                    />
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        intent="primary"
                        onClick={handleConfirmClick}
                        isDisabled={isLoading || !phoneNumber}
                    >
                        Add number
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </>
    )
}
