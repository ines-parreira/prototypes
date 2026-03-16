import { useCallback, useContext, useMemo, useRef } from 'react'

import { usePrevious, useUpdateEffect } from '@repo/hooks'
import { shortcutManager } from '@repo/utils'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import type { ShopifyIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import type { InfobarModalProps } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { shopifyDataMappers } from 'pages/common/forms/ProductSearchInput/Mappings'
import ProductSearchInput from 'pages/common/forms/ProductSearchInput/ProductSearchInput'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import {
    addCustomRow,
    addRow,
    onCancel,
    onInit,
    onLineItemChange,
    onNoteChange,
    onNotifyChange,
    onReset,
} from 'state/infobarActions/shopify/editOrder/actions'
import { getEditOrderState } from 'state/infobarActions/shopify/editOrder/selectors'
import { getIntegrationsByType } from 'state/integrations/selectors'
import type { RootState } from 'state/types'
import AddCustomItemPopover from 'Widgets/modules/Shopify/modules/AddCustomItemPopover'
import DraftOrderTable from 'Widgets/modules/Shopify/modules/OrderTable'
import type { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import EditOrderForm from './EditOrderForm'

import css from './EditOrderModal.less'

type OwnProps = {
    editOrder?: Map<any, any>
    data?: {
        actionName: ShopifyActionType | null
        order?: Map<any, any> | null
        customer?: Map<any, any>
    }
    defaultCurrency?: string
    modalClassName?: string
}

export function EditOrderModalContainer({
    addCustomRow,
    addRow,
    onLineItemChange,
    defaultCurrency = 'USD',
    data = { actionName: null, order: null },
    integrations,
    isOpen,
    loading,
    loadingMessage,
    payload,
    products,
    calculatedEditOrder,
    onInit,
    onClose,
    onChange,
    onCancel,
    onNotifyChange,
    onNoteChange,
    onBulkChange,
    onSubmit,
    onReset,
    title,
    modalClassName,
}: Omit<InfobarModalProps, 'data'> &
    OwnProps &
    ConnectedProps<typeof connector>) {
    const { integrationId } = useContext(IntegrationContext)
    const modalRef = useRef<HTMLDivElement>(null)

    const currentIntegration = useMemo(
        () =>
            integrations.find(
                (integration) => integration.id === integrationId,
            ),
        [integrations, integrationId],
    )
    const hasScope = useMemo(
        () =>
            ['write_order_edits', 'read_order_edits'].every(function (scope) {
                return currentIntegration?.meta.oauth.scope?.includes(scope)
            }),
        [currentIntegration],
    )
    const currencyCode = useMemo(
        () => currentIntegration?.meta.currency || defaultCurrency,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentIntegration],
    )
    const previousIsOpen = usePrevious(isOpen)
    const lineItems = useMemo(
        () => (payload?.get('line_items') || fromJS([])) as List<Map<any, any>>,
        [payload],
    )
    const isEmpty = useMemo(() => lineItems.size === 0, [lineItems])

    const handleCancel = useCallback(
        (via: string) => () => {
            onCancel(data.actionName!, integrationId!, via)
            onClose()
            handleReset()
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data, integrationId, onClose],
    )

    const handleReset = useCallback(() => {
        onReset()
        shortcutManager.unpause()
    }, [onReset])

    const handleLineItemUpdate = useCallback(
        (newLineItem: Map<any, any>, index: number) => {
            void onLineItemChange(integrationId!, { newLineItem, index })
        },
        [integrationId, onLineItemChange],
    )

    const handleLineItemDelete = useCallback(
        (index: number) => {
            void onLineItemChange(integrationId!, { remove: true, index })
        },
        [integrationId, onLineItemChange],
    )

    const handlePaymentSubmit = useCallback(() => {
        onBulkChange(
            [
                { name: 'note', value: payload && payload.get('note') },
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
            },
        )
    }, [onBulkChange, payload, calculatedEditOrder, onSubmit, handleReset])

    useUpdateEffect(() => {
        if (!previousIsOpen && isOpen) {
            if (hasScope) {
                void onInit(
                    integrationId!,
                    data.order,
                    data.customer!,
                    currencyCode,
                    () => {
                        onClose()
                        handleReset()
                    },
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
        data,
        hasScope,
        integrationId,
        onClose,
        currencyCode,
        onChange,
        onInit,
        handleReset,
    ])
    if (!hasScope) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    onClose()
                    handleReset()
                }}
                size="huge"
                className={modalClassName}
            >
                <ModalHeader title={title} />
                <Alert type={AlertType.Error}>
                    Missing Shopify permissions. To use this new feature, please
                    go to the{' '}
                    <Link
                        to={`/app/settings/integrations/shopify/${integrationId!}`}
                    >
                        settings page of your Shopify integration&nbsp;
                    </Link>
                    {`and click on "Update App Permissions".`}
                </Alert>
            </Modal>
        )
    }
    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel('header')}
            size="huge"
            ref={modalRef}
            className={modalClassName}
        >
            <ModalHeader title={title} />
            <div className={css.formHeader}>
                <ProductSearchInput
                    className={css.searchInput}
                    onVariantClicked={(item, variant) => {
                        void addRow(
                            data.actionName!,
                            integrationId!,
                            item.data,
                            variant,
                        )
                    }}
                    autoFocus={false}
                    searchOnFocus={true}
                    dataMappers={shopifyDataMappers}
                />
                <AddCustomItemPopover
                    id="add-custom-item"
                    actionName={data.actionName!}
                    className={css.headerButton}
                    currencyCode={currencyCode}
                    onSubmit={(lineItem) => {
                        void addCustomRow(integrationId!, lineItem)
                    }}
                    container={modalRef}
                />
            </div>
            {payload ? (
                <div>
                    <DraftOrderTable
                        shopName={currentIntegration!.meta.shop_name}
                        actionName={data.actionName!}
                        isShownInEditOrder={true}
                        currencyCode={currencyCode}
                        lineItems={lineItems}
                        products={products}
                        onLineItemUpdate={handleLineItemUpdate}
                        onLineItemDelete={handleLineItemDelete}
                        container={modalRef}
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
                                    payload.set('notify', notify),
                                )
                            }}
                        />
                    ) : (
                        <div className={css.spinner}>
                            <LoadingSpinner />
                        </div>
                    )}
                </div>
            ) : (
                <div className={css.spinner}>
                    <LoadingSpinner />
                </div>
            )}
            <ModalFooter className={css.footer}>
                <div className={css.buttonGroup}>
                    <Button
                        tabIndex={0}
                        className={css.focusable}
                        onClick={handleCancel('footer')}
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
                    disabled={
                        loading ||
                        isEmpty ||
                        (calculatedEditOrder &&
                            !calculatedEditOrder.get('has_changes'))
                    }
                    tabIndex={0}
                    className={classnames(css.focusable, 'ml-auto')}
                    onClick={handlePaymentSubmit}
                >
                    Edit order
                </Button>
            </ModalFooter>
        </Modal>
    )
}

const connector = connect(
    (state: RootState) => ({
        integrations: getIntegrationsByType<ShopifyIntegration>(
            IntegrationType.Shopify,
        )(state),
        loading: getEditOrderState(state).get('loading'),
        loadingMessage: getEditOrderState(state).get('loadingMessage'),
        payload: getEditOrderState(state).get('payload') as Map<
            any,
            any
        > | null,
        calculatedEditOrder: getEditOrderState(state).get(
            'calculatedEditOrder',
        ) as Map<any, any> | null,
        products: getEditOrderState(state).get('products'),
    }),
    {
        addCustomRow,
        addRow,
        onLineItemChange,
        onCancel,
        onInit,
        onNotifyChange,
        onReset,
        onNoteChange,
    },
)

export default connector(EditOrderModalContainer)
