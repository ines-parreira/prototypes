import {Label} from '@gorgias/merchant-ui-kit'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import React, {useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {isGorgiasApiError} from 'models/api/types'
import {getBillingStateQuery} from 'models/billing/queries'
import {addSalesCoupon, deleteSalesCoupon} from 'models/billing/resources'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import TextArea from 'pages/common/forms/TextArea'
import {notify} from 'state/notifications/actions'
import {NotificationStatus, NotificationStyle} from 'state/notifications/types'

import css from './AddSalesCouponModal.less'

interface AddSalesCouponModalProps {
    title: string
    onCloseModal: () => void
    isModalOpen: boolean
    availableCoupons: string[]
    alreadyAppliedCoupon: string | undefined
}

export default function AddSalesCouponModal({
    onCloseModal,
    isModalOpen,
    title,
    availableCoupons,
    alreadyAppliedCoupon,
}: AddSalesCouponModalProps) {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const [selectedCoupon, setSelectedCoupon] = useState('')

    const [reason, setReason] = useState('')

    const options = availableCoupons.map((c) => ({label: c, value: c}))

    function handleCloseModalAndResetState() {
        setSelectedCoupon('')
        setReason('')
        onCloseModal()
    }

    const applyCouponMutation = useMutation({
        mutationFn: (params: {coupon_name: string; reason: string}) =>
            addSalesCoupon(params),
        onSuccess: () => {
            void queryClient.invalidateQueries(getBillingStateQuery)
            handleCloseModalAndResetState()
            void dispatch(
                notify({
                    message: `<strong>${selectedCoupon}</strong> coupon has been successfully applied`,
                    status: NotificationStatus.Success,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    noAutoDismiss: false,
                    showIcon: true,
                    allowHTML: true,
                })
            )
        },
        onError: (error) => {
            const msg = isGorgiasApiError(error)
                ? error.response?.data?.error?.msg
                : 'Oops something went wrong'
            void dispatch(
                notify({
                    message: `Could not apply this coupon : ${msg}`,
                    status: NotificationStatus.Error,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    noAutoDismiss: false,
                    showIcon: true,
                    allowHTML: true,
                })
            )
        },
    })

    const deleteCouponMutation = useMutation({
        mutationFn: () => deleteSalesCoupon(),
        onSuccess: () => {
            void queryClient.invalidateQueries(getBillingStateQuery)
            handleCloseModalAndResetState()
            void dispatch(
                notify({
                    message: `Coupon has been successfully deleted`,
                    status: NotificationStatus.Success,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    noAutoDismiss: false,
                    showIcon: true,
                    allowHTML: true,
                })
            )
        },
        onError: (error) => {
            const msg = isGorgiasApiError(error)
                ? error.response?.data?.error?.msg
                : 'Oops something went wrong'
            void dispatch(
                notify({
                    message: `Could not delete the coupon from the subscription : ${msg}`,
                    status: NotificationStatus.Error,
                    style: NotificationStyle.Alert,
                    showDismissButton: true,
                    noAutoDismiss: false,
                    showIcon: true,
                    allowHTML: true,
                })
            )
        },
    })

    return (
        <>
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModalAndResetState}
                size="medium"
            >
                <ModalHeader title={title} />
                <ModalBody>
                    <Label
                        htmlFor="couponValue"
                        isRequired
                        className={css.label}
                    >
                        Coupon value
                    </Label>
                    <SelectField
                        options={options}
                        aria-label="Select coupon"
                        id="couponValue"
                        placeholder="Select coupon"
                        value={selectedCoupon || alreadyAppliedCoupon}
                        fullWidth
                        onChange={(coupon) => {
                            setSelectedCoupon(coupon as string)
                        }}
                        showSelectedOption
                        caption="If a required coupon is not available, contact Sales Manager or Billing support for manual approval."
                    />
                    <br />
                    <Label
                        htmlFor="reasonForDiscount"
                        isRequired
                        className={css.label}
                    >
                        Reason for discount
                    </Label>
                    <TextArea
                        id="reasonForDiscount"
                        value={reason}
                        rows={4}
                        onChange={setReason}
                        maxLength={255}
                        placeholder="Your reason"
                    />
                </ModalBody>
                <ModalFooter className={css.footer}>
                    <div>
                        {alreadyAppliedCoupon && (
                            <Button
                                fillStyle="ghost"
                                intent="destructive"
                                onClick={() => {
                                    deleteCouponMutation.mutate()
                                }}
                                isDisabled={applyCouponMutation.isLoading}
                                isLoading={deleteCouponMutation.isLoading}
                            >
                                Delete Coupon
                            </Button>
                        )}
                    </div>
                    <div className={css.footerRight}>
                        <Button
                            intent="secondary"
                            onClick={handleCloseModalAndResetState}
                            isDisabled={
                                applyCouponMutation.isLoading ||
                                deleteCouponMutation.isLoading
                            }
                        >
                            Cancel
                        </Button>
                        <Button
                            isDisabled={
                                selectedCoupon.length === 0 ||
                                reason.length === 0 ||
                                deleteCouponMutation.isLoading
                            }
                            onClick={() => {
                                applyCouponMutation.mutate({
                                    coupon_name: selectedCoupon,
                                    reason,
                                })
                            }}
                            isLoading={applyCouponMutation.isLoading}
                        >
                            Apply Coupon
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    )
}
