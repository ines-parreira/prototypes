import React, {useState} from 'react'
import {fromJS} from 'immutable'
import {useRouteMatch} from 'react-router-dom'

import {compactInteger} from 'utils'
import useTitle from 'hooks/useTitle'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getCustomers} from 'state/customers/selectors'
import {
    getActiveView,
    hasActiveView as hasActiveViewSelector,
} from 'state/views/selectors'
import {fetchViewItems} from 'state/views/actions'
import {isCreationUrl, isSearchUrl} from 'pages/common/utils/url'
import ViewTable from 'pages/common/components/ViewTable/ViewTable'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import CustomerForm from '../common/components/CustomerForm'
import CustomerListActions from './components/CustomerListActions'

export default function CustomerListContainer() {
    const dispatch = useAppDispatch()
    const customers = useAppSelector(getCustomers)
    const activeView = useAppSelector(getActiveView)
    const hasActiveView = useAppSelector(hasActiveViewSelector)
    const {params}: {params: {viewId: string}} = useRouteMatch()
    const {viewId} = params

    const [isCustomerFormOpen, setCustomerFormOpen] = useState(false)
    const isSearch =
        isSearchUrl(location.pathname, 'users') ||
        isSearchUrl(location.pathname, 'customers')
    const isUpdate =
        !isCreationUrl(location.pathname, 'users') &&
        !isCreationUrl(location.pathname, 'customers')

    let title = 'Loading...'

    if (!isUpdate) {
        title = 'New view'
    } else if (hasActiveView) {
        title = activeView.get('name')
        if (activeView.get('count', 0) > 0) {
            title = `(${compactInteger(activeView.get('count', 0))}) ${title}`
        }
    } else {
        title = 'Wrong view'
    }

    if (isSearch) {
        title = 'Search'
    }

    useTitle(title)

    return (
        <div
            className="d-flex flex-column"
            style={{
                width: '100%',
            }}
        >
            <ViewTable
                type="customer"
                items={customers}
                isUpdate={isUpdate}
                isSearch={isSearch}
                urlViewId={viewId}
                ActionsComponent={CustomerListActions}
                viewButtons={
                    <div className="d-inline-flex align-items-center">
                        <Button
                            type="button"
                            onClick={() => setCustomerFormOpen(true)}
                        >
                            Add customer
                        </Button>

                        <Modal
                            isOpen={isCustomerFormOpen}
                            onClose={() => setCustomerFormOpen(false)}
                        >
                            <ModalHeader title="Add customer" />
                            <CustomerForm
                                customer={fromJS({})}
                                closeModal={() => setCustomerFormOpen(false)}
                                onSuccess={() => dispatch(fetchViewItems())}
                            />
                        </Modal>
                    </div>
                }
            />
        </div>
    )
}
