import React, {ChangeEvent, FormEvent, useCallback, useMemo} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Form, ModalFooter} from 'reactstrap'
import {fromJS, List, Map} from 'immutable'
import {usePrevious, useUpdateEffect} from 'react-use'

import {
    onCancel,
    onInit,
    onLineItemChange,
    onPayloadChange,
    onReset,
    setPayload,
} from '../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/actions'
import {IntegrationType} from '../../../../../../../../../../../models/integration/types'
import {getCancelOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/selectors'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../../../../../../state/types'
import {getFinalCancelOrderPayload} from '../../../../../../../../../../../business/shopify/order'
import Loader from '../../../../../../../../Loader/Loader'
import {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal'
import RefundOrderForm from '../RefundOrderForm/RefundOrderForm'

import css from './CancelOrderModal.less'

type Props = Omit<InfobarModalProps, 'data'> & {
    data: {
        actionName: string | null
        order: Map<any, any>
    }
} & ConnectedProps<typeof connector>

export const CancelOrderModalContainer = (
    {
        data = {
            actionName: null,
            order: fromJS({}),
        },
        header,
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
    }: Props,
    {integrationId}: {integrationId: number}
) => {
    const previousIsOpen = usePrevious(isOpen)

    const integration = useMemo(
        () =>
            integrations.find(
                (integration: Map<any, any>) =>
                    integration.get('id') === integrationId
            ) as Map<any, any>,
        [integrationId, integrations]
    )

    const shopName = useMemo(
        () => integration.getIn(['meta', 'shop_name']) as string,
        [integration]
    )

    useUpdateEffect(() => {
        if (!previousIsOpen && isOpen) {
            void onInit(integrationId, data.order)
            onChange('order_id', data.order.get('id'))
            shortcutManager.pause()
        }
    }, [data, integrationId, isOpen, onChange, previousIsOpen])

    const handleRefundPayloadChange = (refundPayload: Map<any, any>) => {
        const newPayload = payload?.set('refund', refundPayload)

        if (newPayload) {
            void onPayloadChange(integrationId, newPayload)
        }
    }

    const handleRefundPayloadSet = (refundPayload: Map<any, any>) => {
        const newPayload = payload?.set('refund', refundPayload)

        if (newPayload) {
            setPayload(newPayload)
        }
    }

    const handleReasonChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target
        const newPayload = payload
            ?.set('reason', value)
            .set('email', value !== 'fraud')

        newPayload && setPayload(newPayload)
    }

    const handleNotifyChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {checked} = event.target
        const newPayload = payload?.set('email', checked)

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
            void onLineItemChange(integrationId, lineItem, index)
        },
        [integrationId, onLineItemChange]
    )

    return integration ? (
        <Modal
            header={header}
            isOpen={isOpen}
            onClose={() => {
                handleCancel('header')
            }}
            keyboard={false}
            size="xl"
            bodyClassName="p-0"
            backdrop="static"
        >
            <Form onSubmit={handleSubmit}>
                {payload && lineItems && (
                    <RefundOrderForm
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
                        <div className="ml-3">
                            <Loader
                                className={css.spinner}
                                minHeight="20px"
                                size="20px"
                            />
                            <span className="ml-2">{loadingMessage}</span>
                        </div>
                    )}
                    <Button
                        color="primary"
                        type="submit"
                        disabled={loading}
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

CancelOrderModalContainer.contextTypes = {
    integrationId: PropTypes.number.isRequired,
}

const connector = connect(
    (state: RootState) => ({
        integrations: getIntegrationsByTypes([IntegrationType.Shopify])(state),
        loading: getCancelOrderState(state).get('loading') as boolean,
        loadingMessage: getCancelOrderState(state).get(
            'loadingMessage'
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
    }
)

export default connector(CancelOrderModalContainer as any)
