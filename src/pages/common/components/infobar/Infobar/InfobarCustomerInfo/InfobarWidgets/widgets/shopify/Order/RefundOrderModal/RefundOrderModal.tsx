import React, {ChangeEvent, useMemo} from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Form, ModalFooter} from 'reactstrap'
import {fromJS, List, Map} from 'immutable'
import {useUpdateEffect, usePrevious} from 'react-use'

import {
    onCancel,
    onInit,
    onLineItemsChange,
    onPayloadChange,
    onReset,
    setPayload,
} from '../../../../../../../../../../../state/infobarActions/shopify/refundOrder/actions'
import {getRefundOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/refundOrder/selectors'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors'
import {getFinalRefundOrderPayload} from '../../../../../../../../../../../business/shopify/order'
import {IntegrationType} from '../../../../../../../../../../../models/integration/types'
import {RootState} from '../../../../../../../../../../../state/types'
import Loader from '../../../../../../../../Loader/Loader'
import {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal'
import RefundOrderForm from '../RefundOrderForm/RefundOrderForm'

import css from './RefundOrderModal.less'

type OwnProps = Omit<InfobarModalProps, 'data'> & {
    data: {
        actionName: string | null
        order: Map<any, any>
    }
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const RefundOrderModalContainer = (
    {
        data = {
            actionName: null,
            order: fromJS({}),
        },
        header,
        integrations,
        isOpen,
        lineItems,
        loading,
        loadingMessage,
        onCancel,
        onChange,
        onClose,
        onInit,
        onLineItemsChange,
        onOpen,
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

    useUpdateEffect(() => {
        if (!previousIsOpen && isOpen) {
            onOpen(data.actionName as string)
            void onInit(integrationId, data.order)
            onChange('order_id', data.order.get('id'))
            shortcutManager.pause()
        }
    }, [data, integrationId, isOpen, onChange, onOpen, previousIsOpen])

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

    const handleReasonChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target
        const newPayload = payload?.set('note', value)

        newPayload && setPayload(newPayload)
    }

    const handleNotifyChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {checked} = event.target
        const newPayload = payload?.set('notify', checked)

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
                        reason={payload.get('note', '')}
                        notify={payload.get('notify')}
                        loading={loading}
                        payload={payload}
                        order={data.order}
                        refund={refund}
                        lineItems={lineItems}
                        setPayload={setPayload}
                        onPayloadChange={(payload) => {
                            void onPayloadChange(integrationId, payload)
                        }}
                        onLineItemsChange={(lineItems) => {
                            void onLineItemsChange(integrationId, lineItems)
                        }}
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
                        Cancel
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
                        Refund
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    ) : null
}

RefundOrderModalContainer.contextTypes = {
    integrationId: PropTypes.number.isRequired,
}

const connector = connect(
    (state: RootState) => ({
        integrations: getIntegrationsByTypes([
            IntegrationType.ShopifyIntegrationType,
        ])(state),
        loading: getRefundOrderState(state).get('loading') as boolean,
        loadingMessage: getRefundOrderState(state).get(
            'loadingMessage'
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
        onLineItemsChange,
        onPayloadChange,
        onReset,
        setPayload,
    }
)

export default connector(RefundOrderModalContainer)
