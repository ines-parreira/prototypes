import React from 'react'

import {TicketChannel} from 'business/types/ticket'
import {Customer} from 'models/customer/types'

import SpotlightRow from './SpotlightRow'
import css from './SpotlightCustomerRow.less'

const SpotlightCustomerRow = ({
    item,
    onCloseModal,
    id,
    index,
}: {
    item: Customer
    onCloseModal: () => void
    id: number
    index: number
}) => {
    const phoneNumber = item.channels.find(
        (channel) => channel.type === TicketChannel.Phone
    )?.address

    return (
        <SpotlightRow
            id={id}
            index={index}
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
