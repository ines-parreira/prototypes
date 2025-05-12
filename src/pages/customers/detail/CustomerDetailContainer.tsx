import { useEffect, useMemo, useState } from 'react'

import _pick from 'lodash/pick'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'

import { TicketChannel } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import { RecentItems } from 'hooks/useRecentItems/constants'
import useRecentItems from 'hooks/useRecentItems/useRecentItems'
import { PickedCustomer, pickedCustomerFields } from 'models/search/types'
import CreateTicketButton from 'pages/common/components/CreateTicket/CreateTicketButton'
import Loader from 'pages/common/components/Loader/Loader'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import Timeline from 'pages/common/components/timeline/Timeline'
import CustomerForm from 'pages/customers/common/components/CustomerForm'
import { fetchCustomer } from 'state/customers/actions'
import * as customersHelpers from 'state/customers/helpers'
import {
    DEPRECATED_getActiveCustomer,
    getLoading,
    makeGetActiveCustomerChannelsByType,
} from 'state/customers/selectors'
import { RootState } from 'state/types'

import css from './CustomerDetailContainer.less'

const getActiveCustomerTicketChannels = makeGetActiveCustomerChannelsByType([
    TicketChannel.Email,
    TicketChannel.Phone,
])

export const CustomerDetailContainer = ({
    activeCustomer,
    customersLoading,
    fetchCustomer,
}: ConnectedProps<typeof connector>) => {
    const filteredChannels = useAppSelector(getActiveCustomerTicketChannels)
    const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false)
    const params = useParams<{ customerId?: string }>()
    const customerId = useMemo(() => params.customerId || '', [params])
    const { setRecentItem } = useRecentItems<PickedCustomer>(
        RecentItems.Customers,
    )

    useEffect(() => {
        if (activeCustomer.get('id')) {
            const customer = activeCustomer.toJS()
            const pickedCustomer = _pick(customer, pickedCustomerFields)
            void setRecentItem(pickedCustomer)
        }
    }, [activeCustomer, setRecentItem])

    useEffect(() => {
        fetchCustomer(customerId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId])

    const shouldDisplayLoader = !!customersLoading.get('active')
    const createTicketOptions = useMemo(
        () => ({
            pathname: `/app/ticket/new`,
            search: `?customer=${activeCustomer.get('id') as number}`,
            state: {
                receiver: {
                    name: activeCustomer.get('name'),
                    address: filteredChannels[0]?.address,
                },
            },
        }),
        [activeCustomer, filteredChannels],
    )

    return shouldDisplayLoader ? (
        <Loader message="Loading customer..." />
    ) : (
        <div className={css.customerDetailContainer}>
            <div className={css.header}>
                <h1 className={css.title}>
                    {customersHelpers.getDisplayName(activeCustomer)}
                </h1>
                <div className={css.buttons}>
                    <CreateTicketButton
                        buttonProps={{ intent: 'secondary' }}
                        to={createTicketOptions}
                    />
                </div>
            </div>
            <Timeline shopperId={Number(params.customerId)} />
            <Modal
                isOpen={isCustomerFormOpen}
                onClose={() => setIsCustomerFormOpen(false)}
            >
                <ModalHeader
                    title={`Update customer: ${
                        activeCustomer.get('name') as string
                    }`}
                />
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
        activeCustomer: DEPRECATED_getActiveCustomer(state),
        customersLoading: getLoading(state),
    }),
    {
        fetchCustomer,
    },
)

export default connector(CustomerDetailContainer)
