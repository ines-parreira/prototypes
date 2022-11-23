import React, {useCallback, useContext} from 'react'
import {Button, ModalFooter} from 'reactstrap'
import classnames from 'classnames'
import {useUpdateEffect, usePrevious} from 'react-use'

import _noop from 'lodash/noop'
import {
    onCancel,
    onInit,
    onReset,
} from 'state/infobarActions/bigcommerce/createOrder/actions'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'

import {InfobarModalProps} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'

import {
    BigCommerceActionType,
    Customer,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/types'
import Alert from 'pages/common/components/Alert/Alert'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import useAppDispatch from 'hooks/useAppDispatch'
import ProductSearchInput from 'pages/common/forms/ProductSearchInput/ProductSearchInput'
import {bigcommerceDataMappers} from 'pages/common/forms/ProductSearchInput/Mappings'
import css from './OrderModal.less'

type Props = {
    data?: {
        actionName: BigCommerceActionType | null
        customer: Customer | null
    }
} & Omit<InfobarModalProps, 'data'>

export default function OrderModal({
    data = {actionName: null, customer: null},
    isOpen,
    onClose,
}: Props) {
    const {integrationId} = useContext(IntegrationContext)
    const previousIsOpen = usePrevious(isOpen)
    const dispatch = useAppDispatch()

    const handleReset = useCallback(() => {
        dispatch(onReset())
        shortcutManager.unpause()
    }, [dispatch])

    const handleCancel = useCallback(
        (via: string) => () => {
            onClose()
            dispatch(onCancel(integrationId!, via))
            handleReset()
        },
        [dispatch, handleReset, integrationId, onClose]
    )

    useUpdateEffect(() => {
        if (!previousIsOpen && isOpen) {
            if (data.customer && integrationId) {
                void dispatch(onInit(data.customer, integrationId))
            }
            shortcutManager.pause()
        }
    }, [isOpen, previousIsOpen, data, integrationId, onInit, dispatch])
    return (
        <Modal isOpen={isOpen} onClose={handleCancel('header')} size="medium">
            <ModalHeader title="Add order" />
            <div className={css.formBody}>
                <Alert className={css.paddedVertical}>
                    <i className={classnames(css.infoIcon, 'material-icons')}>
                        info
                    </i>
                    <span>
                        Add an order with status <strong>Paid</strong> and{' '}
                        <strong>Awaiting Fulfillment</strong>.
                    </span>
                </Alert>
                <p className={classnames(css.paddedVertical, css.subsection)}>
                    Products
                </p>
                {isOpen && (
                    <ProductSearchInput
                        className={css.searchInput}
                        dataMappers={bigcommerceDataMappers}
                        onVariantClicked={_noop}
                    />
                )}
                <p className={css.subsection}>Fulfillment</p>
                <div>
                    <h5 className={css.subsectionSmall}>Shipping address</h5>
                </div>
                <p className={css.subsection}>Comments & Notes</p>
                <div>
                    <h5 className={css.subsectionSmall}>Comment</h5>
                    <textarea
                        rows={1}
                        className="form-control"
                        placeholder="Add comment..."
                        value=""
                        onChange={() => null}
                    />
                    <p className={css.infoText}>Visible to customer</p>
                </div>
                <div>
                    <h5 className={css.subsectionSmall}>Staff note</h5>
                    <textarea
                        rows={1}
                        className={classnames('form-control')}
                        placeholder="Add note..."
                        value=""
                        onChange={() => null}
                    />
                    <p className={css.infoText}>Not visible to customer</p>
                </div>
            </div>
            <ModalFooter className={css.formFooter}>
                <Button color="primary" tabIndex={0} className={css.focusable}>
                    Add order
                </Button>
                <Button
                    tabIndex={0}
                    className={classnames(css.focusable, 'ml-auto')}
                    onClick={handleCancel('footer')}
                >
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    )
}
