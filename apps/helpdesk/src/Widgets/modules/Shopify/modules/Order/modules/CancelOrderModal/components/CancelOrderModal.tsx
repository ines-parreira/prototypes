import type { ChangeEvent, FormEvent } from 'react'
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

import { getFinalCancelOrderPayload } from 'business/shopify/order'
import { aggregateMaximumRefundableByGateway } from 'business/shopify/refund'
import type { ShopifyIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
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
} from 'state/infobarActions/shopify/cancelOrder/actions'
import { getCancelOrderState } from 'state/infobarActions/shopify/cancelOrder/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'
import type { RootState } from 'state/types'
import OrderForm from 'Widgets/modules/Shopify/modules/Order/modules/OrderForm'

import css from './CancelOrderModal.less'

type Props = Omit<InfobarModalProps, 'data'> & {
    data: {
        actionName: string | null
        order: Map<any, any>
    }
    modalClassName?: string
} & ConnectedProps<typeof connector>

export const CancelOrderModalContainer = ({
    data = {
        actionName: null,
        order: fromJS({}),
    },
    integrations,
    isOpen,
    loading,
    loadingMessage,
    lineItems,
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
    const { integrationId } = useContext(IntegrationContext)

    const previousIsOpen = usePrevious(isOpen)
    const hasMultipleGateways =
        aggregateMaximumRefundableByGateway(refund).keySeq().count() > 1

    const integration = useMemo(
        () =>
            integrations.find(
                (integration) => integration.id === integrationId,
            ),
        [integrationId, integrations],
    )

    const shopName = useMemo(() => {
        return integration?.meta.shop_name || ''
    }, [integration])

    useUpdateEffect(() => {
        if (!previousIsOpen && isOpen) {
            void onInit(integrationId!, data.order)
            onChange('order_id', data.order.get('id'))
            shortcutManager.pause()
        }
    }, [data, integrationId, isOpen, onChange, previousIsOpen])

    const handleRefundPayloadChange = (refundPayload: Map<any, any>) => {
        const newPayload = payload?.set('refund', refundPayload)

        if (newPayload) {
            void onPayloadChange(integrationId!, newPayload)
        }
    }

    const handleRefundPayloadSet = (refundPayload: Map<any, any>) => {
        const newPayload = payload?.set('refund', refundPayload)

        if (newPayload) {
            setPayload(newPayload)
        }
    }

    const handleReasonChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target
        const newPayload = payload
            ?.set('reason', value)
            .set('email', value !== 'fraud')

        newPayload && setPayload(newPayload)
    }

    const handleNotifyChange = (newValue: boolean) => {
        const newPayload = payload?.set('email', newValue)

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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        if (payload) {
            const finalPayload = getFinalCancelOrderPayload(payload, refund)

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

    return integration ? (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                handleCancel('header')
            }}
            size="huge"
            className={modalClassName}
        >
            <ModalHeader title={title} />
            <Form onSubmit={handleSubmit}>
                {payload && lineItems ? (
                    <OrderForm
                        shopName={shopName}
                        actionName={data.actionName}
                        loading={loading}
                        payload={payload.get('refund')}
                        reason={payload.get('reason')}
                        notify={payload.get('email')}
                        order={data.order}
                        refund={refund}
                        lineItems={lineItems}
                        setPayload={handleRefundPayloadSet}
                        onPayloadChange={handleRefundPayloadChange}
                        onLineItemChange={onLineChange}
                        onReasonChange={handleReasonChange}
                        onNotifyChange={handleNotifyChange}
                    />
                ) : (
                    <div className={css.spinner}>
                        <LoadingSpinner />
                    </div>
                )}
                <ModalFooter className={css.footer}>
                    <Button
                        tabIndex={0}
                        className={css.focusable}
                        onClick={() => {
                            handleCancel('footer')
                        }}
                    >
                        Keep order
                    </Button>
                    {loading && (
                        <div className={css.loading}>
                            <LoadingSpinner size="small" />
                            <span>{loadingMessage}</span>
                        </div>
                    )}
                    <Button
                        color="primary"
                        type="submit"
                        disabled={loading || hasMultipleGateways}
                        tabIndex={0}
                        className={classnames(css.focusable, 'ml-auto')}
                    >
                        Cancel order
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
        loading: getCancelOrderState(state).get('loading') as boolean,
        loadingMessage: getCancelOrderState(state).get(
            'loadingMessage',
        ) as string,
        payload: getCancelOrderState(state).get('payload') as Map<
            any,
            any
        > | null,
        lineItems: getCancelOrderState(state).get('lineItems') as List<any>,
        refund: getCancelOrderState(state).get('refund') as Map<any, any>,
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

export default connector(CancelOrderModalContainer as any)
