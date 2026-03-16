import type { ChangeEvent } from 'react'
import { useCallback, useContext, useMemo } from 'react'

import { usePrevious, useUpdateEffect } from '@repo/hooks'
import { shortcutManager } from '@repo/utils'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Button, Form } from 'reactstrap'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import {
    getFinalRefundOrderPayload,
    getFormattedRefundAmount,
} from 'business/shopify/order'
import { getRefundAmount } from 'business/shopify/refund'
import type { ShopifyIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import type { InfobarModalProps } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import {
    onCancel,
    onInit,
    onLineItemChange,
    onPayloadChange,
    onReset,
    setPayload,
} from 'state/infobarActions/shopify/refundOrder/actions'
import { getRefundOrderState } from 'state/infobarActions/shopify/refundOrder/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'
import type { RootState } from 'state/types'
import OrderForm from 'Widgets/modules/Shopify/modules/Order/modules/OrderForm'

import css from './RefundOrderModal.less'

type OwnProps = Omit<InfobarModalProps, 'data'> & {
    data: {
        actionName: string | null
        order: Map<any, any>
    }
    modalClassName?: string
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const RefundOrderModalContainer = ({
    data = {
        actionName: null,
        order: fromJS({}),
    },
    integrations,
    isOpen,
    lineItems,
    loading,
    loadingMessage,
    onCancel,
    onChange,
    onClose,
    onInit,
    onLineItemChange,
    onPayloadChange,
    onReset,
    onSubmit,
    payload,
    refund,
    setPayload,
    title,
    modalClassName,
}: Props) => {
    const previousIsOpen = usePrevious(isOpen)
    const { integrationId } = useContext(IntegrationContext)

    useUpdateEffect(() => {
        if (!previousIsOpen && isOpen) {
            void onInit(integrationId!, data.order)
            onChange('order_id', data.order.get('id'))
            shortcutManager.pause()
        }
    }, [data, integrationId, isOpen, onChange, previousIsOpen])

    const integration = useMemo(
        () =>
            integrations.find(
                (integration) => integration.id === integrationId,
            ),
        [integrations, integrationId],
    )

    const shopName = useMemo(
        () => integration?.meta.shop_name || '',
        [integration],
    )

    const handleReasonChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target
        const newPayload = payload?.set('note', value)

        newPayload && setPayload(newPayload)
    }

    const handleNotifyChange = (newValue: boolean) => {
        const newPayload = payload?.set('notify', newValue)

        newPayload && setPayload(newPayload)
    }

    const handleCancel = (via: string) => {
        onCancel(via)
        onClose()
        handleClose()
    }

    const handleClose = () => {
        shortcutManager.unpause()
        onReset()
    }

    const handleSubmit = (event: ChangeEvent<HTMLFormElement>) => {
        if (payload) {
            const finalPayload = getFinalRefundOrderPayload(payload, refund)

            event.preventDefault()

            onChange('payload', finalPayload.toJS(), () => {
                onSubmit()
                handleClose()
            })
        }
    }

    const onLineChange = useCallback(
        (lineItem: Map<string, any>, index: number) => {
            void onLineItemChange(integrationId!, lineItem, index)
        },
        [integrationId, onLineItemChange],
    )

    const amount = !!payload ? getRefundAmount(payload) : 0

    return integration ? (
        <Modal
            size="huge"
            isOpen={isOpen}
            onClose={() => {
                handleCancel('header')
            }}
            className={modalClassName}
        >
            <ModalHeader title={title} />
            <Form onSubmit={handleSubmit}>
                {payload && lineItems && (
                    <OrderForm
                        shopName={shopName}
                        actionName={data.actionName}
                        reason={payload.get('note', '')}
                        notify={payload.get('notify')}
                        loading={loading}
                        payload={payload}
                        order={data.order}
                        refund={refund}
                        lineItems={lineItems}
                        setPayload={setPayload}
                        onPayloadChange={(payload) => {
                            void onPayloadChange(integrationId!, payload)
                        }}
                        onLineItemChange={onLineChange}
                        onReasonChange={handleReasonChange}
                        onNotifyChange={handleNotifyChange}
                        keepLineItemQuantityAsDefault={false}
                    />
                )}
                <ModalFooter className={css.footer}>
                    <div className={css.buttonGroup}>
                        <Button
                            tabIndex={0}
                            className={css.focusable}
                            onClick={() => {
                                handleCancel('footer')
                            }}
                        >
                            Cancel
                        </Button>
                        {loading && (
                            <div className={css.buttonGroup}>
                                <LoadingSpinner size="small" />
                                <span>{loadingMessage}</span>
                            </div>
                        )}
                    </div>
                    <Button
                        color="primary"
                        type="submit"
                        disabled={loading || amount === 0}
                        tabIndex={0}
                        className={classnames(css.focusable, 'ml-auto')}
                    >
                        Refund{' '}
                        <MoneyAmount
                            amount={
                                payload
                                    ? getFormattedRefundAmount(payload)
                                    : '0'
                            }
                            currencyCode={payload?.get('currency') || null}
                            renderIfZero
                        />
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    ) : null
}

const connector = connect(
    (state: RootState) => ({
        integrations: getIntegrationsByType<ShopifyIntegration>(
            IntegrationType.Shopify,
        )(state),
        loading: getRefundOrderState(state).get('loading') as boolean,
        loadingMessage: getRefundOrderState(state).get(
            'loadingMessage',
        ) as string,
        payload: getRefundOrderState(state).get('payload') as Map<
            any,
            any
        > | null,
        lineItems: getRefundOrderState(state).get('lineItems') as List<any>,
        refund: getRefundOrderState(state).get('refund') as Map<any, any>,
    }),
    {
        onCancel,
        onInit,
        onLineItemChange,
        onPayloadChange,
        onReset,
        setPayload,
    },
)

export default connector(RefundOrderModalContainer)
