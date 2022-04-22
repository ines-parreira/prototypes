import React, {ChangeEvent, useCallback, useContext, useMemo} from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Form, ModalFooter} from 'reactstrap'
import {fromJS, List, Map} from 'immutable'
import {useUpdateEffect, usePrevious} from 'react-use'

import {
    onCancel,
    onInit,
    onLineItemChange,
    onPayloadChange,
    onReset,
    setPayload,
} from '../../../../../../../../../../../state/infobarActions/shopify/refundOrder/actions'
import {getRefundOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/refundOrder/selectors'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../../../../../../state/types'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getFinalRefundOrderPayload} from '../../../../../../../../../../../business/shopify/order'
import {IntegrationType} from '../../../../../../../../../../../models/integration/types'
import Loader from '../../../../../../../../Loader/Loader'
import DEPRECATED_Modal from '../../../../../../../../DEPRECATED_Modal'
import {InfobarModalProps} from '../../../types'
import {IntegrationContext} from '../../../IntegrationContext'
import RefundOrderForm from '../RefundOrderForm/RefundOrderForm'

import css from './RefundOrderModal.less'

type OwnProps = Omit<InfobarModalProps, 'data'> & {
    data: {
        actionName: string | null
        order: Map<any, any>
    }
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const RefundOrderModalContainer = ({
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
    onLineItemChange,
    onPayloadChange,
    onReset,
    onSubmit,
    payload,
    refund,
    setPayload,
}: Props) => {
    const previousIsOpen = usePrevious(isOpen)
    const {integrationId} = useContext(IntegrationContext)
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
        [integrationId, onLineItemChange]
    )

    return integration ? (
        <DEPRECATED_Modal
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
                            void onPayloadChange(integrationId!, payload)
                        }}
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
        </DEPRECATED_Modal>
    ) : null
}

const connector = connect(
    (state: RootState) => ({
        integrations: getIntegrationsByTypes([IntegrationType.Shopify])(state),
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
        onLineItemChange,
        onPayloadChange,
        onReset,
        setPayload,
    }
)

export default connector(RefundOrderModalContainer)
