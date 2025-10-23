import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react'

import { shortcutManager } from '@repo/utils'

import { LegacyButton as Button } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    BigCommerceActionType,
    BigCommerceIntegration,
    BigCommerceRefundType,
    IntegrationType,
} from 'models/integration/types'
import GeneralErrorPopupModal from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/GeneralErrorPopupModal'
import { InfobarModalProps } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import {
    GroupContext,
    GroupPositionContext,
} from 'pages/common/components/layout/Group'
import Modal from 'pages/common/components/modal/Modal'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import { CustomerContext } from 'providers/infobar/CustomerContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getIntegrationsByType } from 'state/integrations/selectors'

import { EntireOrderRefundOrderModal } from './components/EntireOrderRefundOrderModal'
import { ManualAmountRefundOrderModal } from './components/ManualAmountRefundOrderModal'
import { RefundMethodPickerSection } from './components/RefundMethodPickerSection'
import { RefundOrderFooter } from './components/RefundOrderFooter'
import {
    bigcommerceRefundOrderReducer,
    initialBigCommerceRefundOrderState,
} from './reducer'
import { BigCommerceRefundActionType } from './types'
import {
    bigcommerceRefundOrder,
    calculateAvailablePaymentOptionsData,
    calculateOrderRefund,
    formatAmount,
    onReset,
} from './utils'

import css from './RefundOrderModal.less'

type Props = {
    integration: BigCommerceIntegration
    customerId: number
} & ConnectedProps

export function RefundOrderModal({
    integration,
    customerId,
    data = { actionName: null, order: null },
    onClose,
}: Props) {
    const dispatch = useAppDispatch()

    const orderId: number = data?.order?.get('id')
    const currencyCode: Maybe<string> = data?.order?.get('currency_code')

    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [refundOrderState, dispatchRefundOrderState] = useReducer(
        bigcommerceRefundOrderReducer,
        initialBigCommerceRefundOrderState,
    )

    const checkRefundItemsPayloadValidity = useCallback(() => {
        if (!refundOrderState.refundItemsPayload) {
            // Initial state
            return true
        }
        return refundOrderState.refundItemsPayload?.items?.length
            ? refundOrderState.refundItemsPayload.items.every(
                  (item) =>
                      (item?.amount && item.amount > 0) ||
                      (item?.quantity && item.quantity > 0),
              )
            : false
    }, [refundOrderState.refundItemsPayload])

    const checkRefundModalValidity = useCallback(() => {
        return (
            checkRefundItemsPayloadValidity() &&
            refundOrderState.availablePaymentOptionsData &&
            refundOrderState.selectedPaymentOption &&
            refundOrderState.availablePaymentOptionsData?.refund_methods?.find(
                (paymentOption) =>
                    paymentOption === refundOrderState.selectedPaymentOption,
            )
        )
    }, [
        refundOrderState.availablePaymentOptionsData,
        refundOrderState.selectedPaymentOption,
        checkRefundItemsPayloadValidity,
    ])

    const handleReset = useCallback(() => {
        onReset({
            dispatchRefundOrderState,
        })
    }, [])

    const handleCancel = (via: string) => {
        onClose()
        logEvent(SegmentEvent.BigCommerceRefundOrderCancel, { via })
        handleReset()
    }

    useEffect(() => {
        calculateOrderRefund({
            integrationId: integration.id,
            customerId,
            orderId,
            dispatchRefundOrderState,
            setIsLoading,
            setErrorMessage,
        }).catch(console.error)

        shortcutManager.pause()

        return () => {
            handleReset()
            shortcutManager.unpause()
        }
    }, [integration.id, customerId, orderId, handleReset])

    useEffect(() => {
        if (
            refundOrderState.refundItemsPayload &&
            checkRefundItemsPayloadValidity()
        ) {
            calculateAvailablePaymentOptionsData({
                integrationId: integration.id,
                customerId,
                orderId,
                refundItemsPayload: refundOrderState.refundItemsPayload,
                dispatchRefundOrderState,
                setIsLoading,
                setErrorMessage,
            }).catch(console.error)
        }
    }, [
        integration.id,
        customerId,
        orderId,
        refundOrderState.refundItemsPayload,
        checkRefundItemsPayloadValidity,
    ])

    useEffect(() => {
        dispatchRefundOrderState({
            type: BigCommerceRefundActionType.SetTotalAmountToRefund,
            totalAmountToRefund: checkRefundModalValidity()
                ? refundOrderState.availablePaymentOptionsData
                      ?.total_refund_amount || 0
                : 0,
        })
    }, [refundOrderState.availablePaymentOptionsData, checkRefundModalValidity])

    const handleRefundOrder = () => {
        if (
            !data?.actionName ||
            !refundOrderState.refundItemsPayload ||
            !refundOrderState.selectedPaymentOption?.length ||
            refundOrderState.totalAmountToRefund <= 0 ||
            !checkRefundModalValidity()
        ) {
            return
        }

        logEvent(SegmentEvent.BigCommerceRefundOrderSubmitRefund, {
            refundedAmount: refundOrderState.totalAmountToRefund,
            type: refundOrderState.refundType,
            method: refundOrderState.selectedPaymentOption.map(
                (option) => option.provider_description,
            ),
        })

        bigcommerceRefundOrder(
            data.actionName,
            dispatch,
            integration,
            customerId?.toString(),
            orderId,
            refundOrderState.refundType,
            refundOrderState.refundItemsPayload,
            refundOrderState.selectedPaymentOption,
            refundOrderState.refundReason,
            refundOrderState.newOrderStatus,
        )

        handleCancel('refund-order')
    }

    return (
        <GroupContext.Provider value={null}>
            <GroupPositionContext.Provider value={null}>
                <Modal
                    isOpen
                    isScrollable
                    isClosable={false}
                    onClose={() => handleCancel('header')}
                    size="medium"
                >
                    <ModalHeader
                        title={`Refund Order #${orderId}`}
                        forceCloseButton
                    />
                    <div className={css.formBody}>
                        <div className={css.flex}>
                            {[
                                BigCommerceRefundType.EntireOrder,
                                BigCommerceRefundType.ManualAmount,
                            ].map((refund) => {
                                return (
                                    <PreviewRadioButton
                                        role="checkbox"
                                        className={
                                            css.previewRadioButtonWrapper
                                        }
                                        key={refund}
                                        value={refund}
                                        label={refund}
                                        isSelected={
                                            refundOrderState.refundType ===
                                            refund
                                        }
                                        isDisabled={
                                            isLoading &&
                                            !refundOrderState.refundData.order
                                        }
                                        onClick={() => {
                                            dispatchRefundOrderState({
                                                type: BigCommerceRefundActionType.SetRefundType,
                                                refundType: refund,
                                            })
                                        }}
                                    />
                                )
                            })}
                        </div>
                        {refundOrderState.refundType ===
                            BigCommerceRefundType.ManualAmount && (
                            <ManualAmountRefundOrderModal
                                refundData={refundOrderState.refundData}
                                refundItemsPayload={
                                    refundOrderState.refundItemsPayload
                                }
                                dispatchRefundOrderState={
                                    dispatchRefundOrderState
                                }
                                currencyCode={currencyCode}
                                isLoading={isLoading}
                                hasError={!checkRefundItemsPayloadValidity()}
                            />
                        )}
                        {refundOrderState.refundType ===
                            BigCommerceRefundType.EntireOrder && (
                            <EntireOrderRefundOrderModal
                                refundData={refundOrderState.refundData}
                                refundItemsPayload={
                                    refundOrderState.refundItemsPayload
                                }
                                availablePaymentOptionsData={
                                    refundOrderState.availablePaymentOptionsData
                                }
                                productImageURLs={
                                    refundOrderState.productImageURLs
                                }
                                dispatchRefundOrderState={
                                    dispatchRefundOrderState
                                }
                                storeHash={integration.meta.store_hash}
                                currencyCode={currencyCode}
                                isLoading={isLoading}
                            />
                        )}
                        <RefundMethodPickerSection
                            availablePaymentOptionsData={
                                refundOrderState.availablePaymentOptionsData
                            }
                            selectedPaymentOption={
                                refundOrderState.selectedPaymentOption
                            }
                            refundType={refundOrderState.refundType}
                            dispatchRefundOrderState={dispatchRefundOrderState}
                            isLoading={isLoading}
                            currencyCode={currencyCode}
                        />
                        <RefundOrderFooter
                            newOrderStatus={refundOrderState.newOrderStatus}
                            dispatchRefundOrderState={dispatchRefundOrderState}
                            isLoading={isLoading}
                        />
                    </div>
                    <ModalFooter className={css.modalFooterWrapper}>
                        <Button
                            tabIndex={0}
                            intent="secondary"
                            onClick={() => handleCancel('footer')}
                        >
                            Cancel
                        </Button>
                        <Button
                            intent="primary"
                            tabIndex={0}
                            onClick={handleRefundOrder}
                            isDisabled={
                                isLoading ||
                                refundOrderState.totalAmountToRefund <= 0 ||
                                !checkRefundModalValidity()
                            }
                        >
                            {`Refund ${formatAmount(
                                currencyCode,
                                refundOrderState.totalAmountToRefund,
                            )}`}
                        </Button>
                    </ModalFooter>
                </Modal>
                {errorMessage && (
                    <GeneralErrorPopupModal
                        isOpen={true}
                        errorMessage={errorMessage}
                        onClose={() => {
                            setErrorMessage('')
                            handleCancel('error')
                        }}
                    />
                )}
            </GroupPositionContext.Provider>
        </GroupContext.Provider>
    )
}

type ConnectedProps = {
    data?: {
        actionName: BigCommerceActionType | null
        order: Map<string, any> | null
    }
} & Pick<InfobarModalProps, 'isOpen' | 'onClose'>

export default function RefundOrderModalRenderWrapper(props: ConnectedProps) {
    const { integrationId } = useContext(IntegrationContext)
    const { customerId } = useContext(CustomerContext)

    const integrations = useAppSelector(
        getIntegrationsByType(IntegrationType.BigCommerce),
    )

    const integration = useMemo(
        () =>
            integrations.find(
                (integration) => integration.id === integrationId,
            ),
        [integrations, integrationId],
    )

    if (!integration || !props.isOpen || !customerId) {
        return null
    }

    return (
        <RefundOrderModal
            {...props}
            integration={integration as BigCommerceIntegration}
            customerId={customerId}
        />
    )
}
