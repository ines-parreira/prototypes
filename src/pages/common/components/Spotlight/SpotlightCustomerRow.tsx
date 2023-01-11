import React from 'react'

import {TicketChannel} from 'business/types/ticket'
import {Customer} from 'state/customers/types'

import SpotlightRow from './SpotlightRow'
import css from './SpotlightCustomerRow.less'

const SpotlightCustomerRow = ({
    item,
    onCloseModal,
}: {
    item: Customer
    onCloseModal: () => void
}) => {
    const phoneNumber = item.channels.find(
        (channel) => channel.type === TicketChannel.Phone
    )?.address

    return (
        <SpotlightRow
            title={item.name || `Customer #${item.id}`}
            info={
                <SpotlightCustomerInfo email={item.email} phone={phoneNumber} />
            }
            link={`/app/customer/${item.id}`}
            onCloseModal={onCloseModal}
            shrinkInfo
        />
    )
}

const SpotlightCustomerInfo = ({
    email,
    phone,
}: {
    email: string | null
    phone?: string
}) => {
    if (!email && !phone) {
        return null
    }

    return (
        <div className={css.customerInfo}>
            {!!email && <span className={css.infoText}>{email}</span>}
            {!!phone && (
                <>
                    <span className={css.infoSeparator}>•</span>
                    <span>{phone}</span>
                </>
            )}
        </div>
    )
}

export default SpotlightCustomerRow
