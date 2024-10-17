import React from 'react'
import {
    TicketChannel,
    UpdateCustomerBodyChannelsItem,
    useGetCustomer,
    useUpdateCustomer,
} from '@gorgias/api-queries'
import {isValidPhoneNumber} from 'libphonenumber-js'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import SourceIcon from 'pages/common/components/SourceIcon'
import {SUBMIT_CUSTOMER_SUCCESS} from 'state/customers/constants'
import css from '../../Infobar.less'

type Props = {
    customerId: number
}

export default function NewPhoneNumber({customerId}: Props) {
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [phoneNumber, setPhoneNumber] = React.useState('')
    const [error, setError] = React.useState<string>()

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

    const {mutate: updateCustomer, isLoading} = useUpdateCustomer({
        mutation: {
            onError: (error) => {
                const customerChannelsLength =
                    customerDetails?.data?.channels?.length ?? 0
                const phoneNumberError = (
                    error.response?.data as {
                        error?: {data?: {channels?: {_schema?: string}[]}}
                    }
                ).error?.data?.channels?.[customerChannelsLength]._schema?.[0]

                void dispatch(
                    notify({
                        message:
                            phoneNumberError ?? `Failed to update customer`,
                        status: NotificationStatus.Error,
                    })
                )
            },
            onSuccess: (response) => {
                void dispatch(
                    notify({
                        message: `Phone number added to customer`,
                        status: NotificationStatus.Success,
                    })
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
                        type: TicketChannel.Phone,
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
                    type={TicketChannel.Phone}
                    className="uncolored mr-2"
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
