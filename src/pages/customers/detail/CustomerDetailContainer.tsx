import React, {useEffect, useMemo, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, List} from 'immutable'
import {Button} from 'reactstrap'
import {Link, useParams} from 'react-router-dom'

import {
    fetchCustomer,
    fetchCustomerHistory,
} from '../../../state/customers/actions'

import Loader from '../../common/components/Loader/Loader'
import CustomerForm from '../common/components/CustomerForm.js'
import Timeline from '../../common/components/timeline/Timeline'
import Modal from '../../common/components/Modal'
import {Customer} from '../../../state/customers/types'
import {
    getCustomerHistory,
    getActiveCustomer,
    makeIsLoading,
} from '../../../state/customers/selectors'
import * as customersHelpers from '../../../state/customers/helpers'
import {RootState} from '../../../state/types'

export const CustomerDetailContainer = ({
    activeCustomer,
    customerHistory,
    customersIsLoading,
    fetchCustomer,
    fetchCustomerHistory,
}: ConnectedProps<typeof connector>) => {
    const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false)
    const historyLength = useMemo(
        () => (customerHistory.get('tickets', fromJS([])) as List<any>).size,
        [customerHistory]
    )
    const params = useParams<{customerId?: string}>()
    const customerId = useMemo(() => params.customerId || '', [params])

    useEffect(() => {
        void (async () => {
            const {resp} = await (fetchCustomer(customerId as any) as Promise<{
                resp: Customer
            }>)
            void fetchCustomerHistory(customerId as any, {
                successCondition() {
                    return (resp.id || '').toString() === customerId.toString()
                },
            })
        })()
    }, [customerId])

    const shouldDisplayLoader =
        activeCustomer.isEmpty() || customersIsLoading('active')

    return shouldDisplayLoader ? (
        <Loader message="Loading customer..." />
    ) : (
        <div className="CustomerDetailContainer">
            <div className="flex-spaced-row">
                <h1>{customersHelpers.getDisplayName(activeCustomer)}</h1>

                <div>
                    <Link
                        className="btn btn-secondary mr-2"
                        to={`/app/ticket/new?customer=${
                            activeCustomer.get('id') as number
                        }`}
                    >
                        Create ticket
                    </Link>

                    <Button
                        type="button"
                        color="success"
                        onClick={() => setIsCustomerFormOpen(true)}
                    >
                        Edit customer
                    </Button>
                </div>
            </div>

            {customersIsLoading('history') ? (
                <Loader message="Loading history..." />
            ) : customerHistory.get('triedLoading', true) && !historyLength ? (
                <p>This customer has no activity recorded</p>
            ) : (
                <div className="my-4">
                    <Timeline
                        customerHistory={customerHistory}
                        displayAll
                        revert
                    />
                </div>
            )}

            <Modal
                isOpen={isCustomerFormOpen}
                onClose={() => setIsCustomerFormOpen(false)}
                header={`Update customer: ${
                    activeCustomer.get('name') as string
                }`}
            >
                <CustomerForm
                    customer={activeCustomer}
                    closeModal={() => setIsCustomerFormOpen(false)}
                />
            </Modal>
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        activeCustomer: getActiveCustomer(state),
        customerHistory: getCustomerHistory(state),
        customersIsLoading: makeIsLoading(state),
    }),
    {
        fetchCustomer,
        fetchCustomerHistory,
    }
)

export default connector(CustomerDetailContainer)
