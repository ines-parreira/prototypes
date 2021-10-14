import React, {useCallback, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Alert, Button, ModalFooter} from 'reactstrap'
import {fromJS, List, Map} from 'immutable'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {useUpdateEffect, usePrevious} from 'react-use'

import {
    Product,
    Variant,
} from '../../../../../../../../../../../constants/integrations/types/shopify'
import {getEditOrderState} from '../../../../../../../../../../../state/infobarActions/shopify/editOrder/selectors'
import {
    addCustomRow,
    addRow,
    onCancel,
    onInit,
    onNoteChange,
    onNotifyChange,
    onPayloadChange,
    onReset,
} from '../../../../../../../../../../../state/infobarActions/shopify/editOrder/action'
import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../../../../../../state/types'
import {
    IntegrationType,
    IntegrationDataItem,
} from '../../../../../../../../../../../models/integration/types'
import ProductSearchInput from '../../../../../../../../../forms/ProductSearchInput/ProductSearchInput'
import Loader from '../../../../../../../../Loader/Loader'
import {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal'
import {ShopifyActionType} from '../../types'

import AddCustomItemPopover from '../../shared/DraftOrderModal/AddCustomItemPopover/AddCustomItemPopover'
import EditOrderForm from '../EditOrderForm/EditOrderForm'
import DraftOrderTable from '../../shared/DraftOrderModal//DraftOrderTable/DraftOrderTable'

import css from './EditOrderModal.less'

type OwnProps = {
    editOrder?: Map<any, any>
    data?: {
        actionName: ShopifyActionType | null
        order?: Map<any, any> | null
        customer?: Map<any, any>
    }
    defaultCurrency?: string
}

export function EditOrderModalContainer(
    {
        addCustomRow,
        addRow,
        defaultCurrency = 'USD',
        data = {actionName: null, order: null},
        header,
        integrations,
        isOpen,
        loading,
        loadingMessage,
        payload,
        products,
        calculatedEditOrder,
        onInit,
        onOpen,
        onClose,
        onChange,
        onCancel,
        onPayloadChange,
        onNotifyChange,
        onNoteChange,
        onBulkChange,
        onSubmit,
        onReset,
    }: Omit<InfobarModalProps, 'data'> &
        OwnProps &
        ConnectedProps<typeof connector>,
    {integrationId}: {integrationId: number}
) {
    const currentIntegration = useMemo(
        () =>
            integrations.find(
                (integration: Map<any, any>) =>
                    integration.get('id') === integrationId
            ) as Map<any, any> | null,
        [integrations, integrationId]
    )
    const hasScope = useMemo(
        () =>
            ['write_order_edits', 'read_order_edits'].every(function (scope) {
                return (currentIntegration?.getIn([
                    'meta',
                    'oauth',
                    'scope',
                ]) as string).includes(scope)
            }),
        [currentIntegration]
    )
    const currencyCode = useMemo(
        () =>
            (currentIntegration?.getIn(['meta', 'currency']) as string) ||
            defaultCurrency,
        [currentIntegration]
    )
    const previousIsOpen = usePrevious(isOpen)
    const lineItems = useMemo(
        () => (payload?.get('line_items') || fromJS([])) as List<Map<any, any>>,
        [payload]
    )
    const isEmpty = useMemo(() => lineItems.size === 0, [lineItems])

    const handleCancel = useCallback(
        (via: string) => () => {
            onCancel(data.actionName!, integrationId, via)
            onClose()
            handleReset()
        },
        [data, integrationId, onClose]
    )

    const handlePaymentSubmit = useCallback(
        () => () => {
            onBulkChange(
                [
                    {name: 'note', value: payload && payload.get('note')},
                    {
                        name: 'notify',
                        value: (payload && payload.get('notify')) || false,
                    },
                    {
                        name: 'edited_order_id',
                        value:
                            calculatedEditOrder &&
                            calculatedEditOrder.get('calculatedOrderId'),
                    },
                ],
                () => {
                    onSubmit()
                    handleReset()
                }
            )
        },
        [integrationId, onBulkChange, onSubmit, calculatedEditOrder, payload]
    )
    const handleReset = useCallback(() => {
        onReset()
        shortcutManager.unpause()
    }, [])

    useUpdateEffect(() => {
        if (!previousIsOpen && isOpen) {
            onOpen(data.actionName!)
            if (hasScope) {
                void onInit(
                    integrationId,
                    data.order,
                    data.customer!,
                    currencyCode,
                    () => {
                        onClose()
                        handleReset()
                    }
                )
            }
            shortcutManager.pause()
            if (data.order) {
                onChange('order_id', data.order.get('id'))
            }
        }
    }, [
        isOpen,
        previousIsOpen,
        onOpen,
        data,
        hasScope,
        integrationId,
        onClose,
        currencyCode,
        onChange,
    ])
    if (!hasScope) {
        return (
            <Modal
                header={header}
                isOpen={isOpen}
                onClose={() => {
                    onClose()
                    handleReset()
                }}
            >
                <Alert color="danger">
                    Missing Shopify permissions. To use this new feature, please
                    go to the{' '}
                    <Link
                        to={`/app/settings/integrations/shopify/${integrationId}`}
                    >
                        settings page of your Shopify integration&nbsp;
                    </Link>
                    and click on "Update app permissions".
                </Alert>
            </Modal>
        )
    }
    return (
        <Modal
            header={header}
            isOpen={isOpen}
            onClose={handleCancel('header')}
            keyboard={false}
            size="xl"
            bodyClassName="p-0"
            backdrop="static"
        >
            <div className={css.formHeader}>
                <ProductSearchInput
                    className={css.searchInput}
                    onVariantClicked={(
                        item: IntegrationDataItem<Product>,
                        variant: Variant
                    ) => {
                        void addRow(
                            data.actionName!,
                            integrationId,
                            item.data,
                            variant
                        )
                    }}
                    autoFocus={false}
                    searchOnFocus={true}
                />
                <AddCustomItemPopover
                    id="add-custom-item"
                    actionName={data.actionName!}
                    className={css.headerButton}
                    currencyCode={currencyCode}
                    onSubmit={(lineItem) => {
                        void addCustomRow(integrationId, lineItem)
                    }}
                />
            </div>
            {payload ? (
                <div>
                    <DraftOrderTable
                        shopName={currentIntegration!.getIn([
                            'meta',
                            'shop_name',
                        ])}
                        actionName={data.actionName!}
                        isShownInEditOrder={true}
                        currencyCode={currencyCode}
                        lineItems={lineItems}
                        products={products}
                        onChange={(lineItems) => {
                            void onPayloadChange(
                                integrationId,
                                payload.set('line_items', lineItems)
                            )
                        }}
                    />
                    {calculatedEditOrder ? (
                        <EditOrderForm
                            currencyCode={currencyCode}
                            loading={loading}
                            calculatedEditOrder={calculatedEditOrder}
                            changeNote={(note: string) => {
                                void onNoteChange(payload.set('note', note))
                            }}
                            notifyCustomer={(notify: boolean) => {
                                void onNotifyChange(
                                    payload.set('notify', notify)
                                )
                            }}
                        />
                    ) : (
                        <Loader />
                    )}
                </div>
            ) : (
                <Loader />
            )}
            <ModalFooter className={css.formFooter}>
                <Button
                    tabIndex={0}
                    className={css.focusable}
                    onClick={handleCancel('footer')}
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
                    disabled={
                        loading ||
                        isEmpty ||
                        (calculatedEditOrder &&
                            !calculatedEditOrder.get('has_changes'))
                    }
                    tabIndex={0}
                    className={classnames(css.focusable, 'ml-auto')}
                    onClick={handlePaymentSubmit()}
                >
                    Edit order
                </Button>
            </ModalFooter>
        </Modal>
    )
}

EditOrderModalContainer.contextTypes = {
    integrationId: PropTypes.number.isRequired,
}

const connector = connect(
    (state: RootState) => ({
        integrations: getIntegrationsByTypes([IntegrationType.Shopify])(state),
        loading: getEditOrderState(state).get('loading'),
        loadingMessage: getEditOrderState(state).get('loadingMessage'),
        payload: getEditOrderState(state).get('payload') as Map<
            any,
            any
        > | null,
        calculatedEditOrder: getEditOrderState(state).get(
            'calculatedEditOrder'
        ) as Map<any, any> | null,
        products: getEditOrderState(state).get('products'),
    }),
    {
        addCustomRow,
        addRow,
        onCancel,
        onInit,
        onPayloadChange,
        onNotifyChange,
        onReset,
        onNoteChange,
    }
)

export default connector(EditOrderModalContainer)
