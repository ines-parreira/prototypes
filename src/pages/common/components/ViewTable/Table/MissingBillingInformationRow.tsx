import React, {useMemo, useState} from 'react'

import {useAppNode} from 'appNode'
import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import useDimensions from 'hooks/useDimensions'
import useWindowSize from 'hooks/useWindowSize'
import {useBillingContact} from 'models/billing/queries'
import {AlertType} from 'pages/common/components/Alert/Alert'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import Loader from 'pages/common/components/Loader/Loader'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {BillingInformationFields} from 'pages/settings/new_billing/components/BillingInformationFields/BillingInformationFields'
import {BillingInformationSetupForm} from 'pages/settings/new_billing/components/BillingInformationSetupForm/BillingInformationSetupForm'
import {FormSubmitButton} from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButton'
import {StripeElementsProvider} from 'pages/settings/new_billing/components/StripeElementsProvider/StripeElementsProvider'
import {
    PaymentMethodType,
    type BillingContactDetailResponse,
} from 'state/billing/types'
import {
    paymentMethod as getPaymentMethod,
    hasCreditCard as getHasCreditCard,
} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {hasRole} from 'utils'

import css from './MissingBillingInformationRow.less'

export default function MissingBillingInformationRow() {
    const [isModalOpened, setIsModalOpened] = useState(false)
    const currentUser = useAppSelector(getCurrentUser)
    const hasCreditCard = useAppSelector(getHasCreditCard)
    const paymentMethod = useAppSelector(getPaymentMethod)
    const isAdmin = useMemo(
        () => hasRole(currentUser, UserRole.Admin),
        [currentUser]
    )
    const {width: viewportWidth} = useWindowSize()
    const [rowRef, rowDimensions] = useDimensions()
    const rowMaxWidth = useMemo(
        () => viewportWidth - (rowDimensions?.x || 0),
        [viewportWidth, rowDimensions]
    )
    const appNode = useAppNode()

    const billingInformation = useBillingContact({refetchOnWindowFocus: false})

    const isMissingContactInformation = getIsMissingContactInformation(
        billingInformation.data?.data
    )

    return (
        <>
            {isAdmin &&
                hasCreditCard &&
                paymentMethod !== PaymentMethodType.Shopify &&
                isMissingContactInformation && (
                    <tr>
                        <td colSpan={20} ref={rowRef}>
                            <div
                                className={css.bannerWrapper}
                                style={{
                                    maxWidth: rowMaxWidth,
                                }}
                            >
                                <LinkAlert
                                    actionLabel="Update Now"
                                    className={css.alert}
                                    icon
                                    onAction={() => setIsModalOpened(true)}
                                    type={AlertType.Error}
                                >
                                    You need to complete your billing profile,
                                    please update it now.
                                </LinkAlert>
                            </div>
                        </td>
                    </tr>
                )}
            <Modal
                isOpen={isModalOpened}
                onClose={() => setIsModalOpened(false)}
                container={appNode ?? undefined}
            >
                {!billingInformation.data?.data ? (
                    <Loader />
                ) : (
                    <StripeElementsProvider>
                        <BillingInformationSetupForm
                            billingInformation={billingInformation.data.data}
                            onSuccess={() => setIsModalOpened(false)}
                        >
                            <ModalHeader
                                title="Missing information - Billing"
                                subtitle="According to the regulation, we need to collect this data from all our customers."
                            />
                            <ModalBody>
                                <BillingInformationFields title={null} />
                            </ModalBody>
                            <ModalFooter className={css.modalFooter}>
                                <FormSubmitButton>
                                    Save Billing Information
                                </FormSubmitButton>
                            </ModalFooter>
                        </BillingInformationSetupForm>
                    </StripeElementsProvider>
                )}
            </Modal>
        </>
    )
}

const getIsMissingContactInformation = (
    state?: BillingContactDetailResponse
) => {
    return (
        state &&
        (!state.email ||
            !state.shipping.address.country ||
            !state.shipping.address.postal_code ||
            (state.shipping.address.country === 'US' &&
                !state.shipping.address.state))
    )
}
