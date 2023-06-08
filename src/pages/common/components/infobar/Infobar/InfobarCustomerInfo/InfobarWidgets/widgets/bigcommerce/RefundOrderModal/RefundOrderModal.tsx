import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    BigCommerceActionType,
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceIntegration,
    BigCommerceRefundItemsPayload,
    BigCommerceRefundMethod,
    BigCommerceRefundType,
    CalculateOrderRefundDataResponse,
    IntegrationType,
} from 'models/integration/types'
import {InfobarModalProps} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import {CustomerContext} from 'providers/infobar/CustomerContext'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsByType} from 'state/integrations/selectors'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import Button from 'pages/common/components/button/Button'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import GeneralErrorPopupModal from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/GeneralErrorPopupModal'
import {
    GroupContext,
    GroupPositionContext,
} from 'pages/common/components/layout/Group'
import Spinner from 'pages/common/components/Spinner'
import useAppDispatch from 'hooks/useAppDispatch'
import {defaultBigCommerceRefundType} from './consts'
import {CustomAmountRefundOrderModal} from './components/CustomAmountRefundOrderModal'
import {RefundMethodPickerSection} from './components/RefundMethodPickerSection'
import {RefundOrderFooter} from './components/RefundOrderFooter'
import css from './RefundOrderModal.less'
import {
    bigcommerceRefundOrder,
    calculateAvailablePaymentOptionsData,
    calculateOrderRefund,
    formatAmount,
    onReset,
} from './utils'

type Props = {
    integration: BigCommerceIntegration
    customerId: number
} & ConnectedProps

export function RefundOrderModal({
    integration,
    customerId,
    data = {actionName: null, order: null},
    onClose,
}: Props) {
    const dispatch = useAppDispatch()

    const orderId: number = data?.order?.get('id')
    const currencyCode: Maybe<string> = data?.order?.get('currency_code')

    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [refundType, setRefundType] = useState(defaultBigCommerceRefundType)
    const [refundData, setRefundData] =
        useState<CalculateOrderRefundDataResponse>({
            order: null,
            order_level_refund_data: null,
        })
    const [totalAmountToRefund, setTotalAmountToRefund] = useState(0)
    const [refundItemsPayload, setRefundItemsPayload] =
        useState<Maybe<BigCommerceRefundItemsPayload>>(null)
    const [availablePaymentOptionsData, setAvailablePaymentOptionsData] =
        useState<Maybe<BigCommerceAvailablePaymentOptionsData>>(null)
    const [selectedPaymentOption, setSelectedPaymentOption] =
        useState<Maybe<BigCommerceRefundMethod>>(null)
    const [refundReason, setRefundReason] = useState('')
    const [newOrderStatus, setNewOrderStatus] = useState<Maybe<string>>(null)

    const handleReset = useCallback(() => {
        onReset({
            setRefundType,
            setRefundData,
            setTotalAmountToRefund,
            setRefundItemsPayload,
            setAvailablePaymentOptionsData,
            setSelectedPaymentOption,
            setRefundReason,
            setNewOrderStatus,
        })
    }, [])

    const handleCancel = (via: string) => {
        onClose()
        logEvent(SegmentEvent.BigCommerceRefundOrderCancel, {via})
        handleReset()
    }

    useEffect(() => {
        calculateOrderRefund({
            integrationId: integration.id,
            customerId,
            orderId,
            setRefundData,
            setIsLoading,
            setErrorMessage,
        }).catch(console.error)

        shortcutManager.pause()

        return () => {
            handleReset()
            shortcutManager.unpause()
        }
        // Single run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (refundItemsPayload && checkRefundItemsPayloadValidity()) {
            calculateAvailablePaymentOptionsData({
                integrationId: integration.id,
                customerId,
                orderId,
                refundItemsPayload,
                setAvailablePaymentOptionsData,
                setIsLoading,
                setErrorMessage,
            }).catch(console.error)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refundItemsPayload])

    useEffect(() => {
        checkRefundModalValidity()
            ? setTotalAmountToRefund(
                  availablePaymentOptionsData?.total_refund_amount || 0
              )
            : setTotalAmountToRefund(0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refundItemsPayload, availablePaymentOptionsData, selectedPaymentOption])

    const handleRefundOrder = () => {
        if (
            !data?.actionName ||
            !refundItemsPayload ||
            !selectedPaymentOption?.length ||
            totalAmountToRefund <= 0 ||
            !checkRefundModalValidity()
        ) {
            return
        }

        logEvent(SegmentEvent.BigCommerceRefundOrderSubmitRefund, {
            refundedAmount: totalAmountToRefund,
            type: refundType,
            method: selectedPaymentOption.map(
                (option) => option.provider_description
            ),
        })

        bigcommerceRefundOrder(
            data.actionName,
            dispatch,
            integration,
            customerId?.toString(),
            orderId,
            refundType,
            refundItemsPayload,
            selectedPaymentOption,
            refundReason,
            newOrderStatus
        )

        handleCancel('refund-order')
    }

    const checkRefundItemsPayloadValidity = useCallback(() => {
        if (!refundItemsPayload) {
            // Initial state
            return true
        }
        return refundItemsPayload?.items?.length
            ? refundItemsPayload.items.every(
                  (item) =>
                      (item?.amount && item.amount > 0) ||
                      (item?.quantity && item.quantity > 0)
              )
            : false
    }, [refundItemsPayload])

    const checkRefundModalValidity = useCallback(() => {
        return (
            checkRefundItemsPayloadValidity() &&
            availablePaymentOptionsData &&
            selectedPaymentOption &&
            availablePaymentOptionsData?.refund_methods?.find(
                (paymentOption) => paymentOption === selectedPaymentOption
            )
        )
    }, [
        availablePaymentOptionsData,
        selectedPaymentOption,
        checkRefundItemsPayloadValidity,
    ])

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
                        {isLoading && (
                            <Spinner
                                color="gloom"
                                className={css.spinnerWrapper}
                            />
                        )}
                        {refundType === BigCommerceRefundType.CustomAmount && (
                            <CustomAmountRefundOrderModal
                                refundData={refundData}
                                refundItemsPayload={refundItemsPayload}
                                setRefundItemsPayload={setRefundItemsPayload}
                                setSelectedPaymentOption={
                                    setSelectedPaymentOption
                                }
                                currencyCode={currencyCode}
                                isLoading={isLoading}
                                hasError={!checkRefundItemsPayloadValidity()}
                            />
                        )}
                        <RefundMethodPickerSection
                            availablePaymentOptionsData={
                                availablePaymentOptionsData
                            }
                            selectedPaymentOption={selectedPaymentOption}
                            setSelectedPaymentOption={setSelectedPaymentOption}
                            refundType={refundType}
                            isLoading={isLoading}
                            currencyCode={currencyCode}
                        />
                        <RefundOrderFooter
                            setRefundReason={setRefundReason}
                            newOrderStatus={newOrderStatus}
                            setNewOrderStatus={setNewOrderStatus}
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
                                totalAmountToRefund <= 0 ||
                                !checkRefundModalValidity()
                            }
                        >
                            {`Refund ${formatAmount(
                                currencyCode,
                                totalAmountToRefund
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
    const {integrationId} = useContext(IntegrationContext)
    const {customerId} = useContext(CustomerContext)

    const integrations = useAppSelector(
        getIntegrationsByType(IntegrationType.BigCommerce)
    )

    const integration = useMemo(
        () =>
            integrations.find(
                (integration) => integration.id === integrationId
            ),
        [integrations, integrationId]
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
