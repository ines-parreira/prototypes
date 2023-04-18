import React, {ComponentProps, useMemo} from 'react'

import {TicketChannel} from 'business/types/ticket'
import {Customer} from 'models/customer/types'

import SpotlightRow from './SpotlightRow'
import css from './SpotlightCustomerRow.less'

export const pickedCustomerFields = ['email', 'id', 'name', 'channels'] as const
export type PickedCustomer = Pick<Customer, typeof pickedCustomerFields[number]>

type SpotlightCustomerRowProps = {
    item: Customer | PickedCustomer
    onCloseModal: () => void
    id: number
    index: number
    onHover?: ComponentProps<typeof SpotlightRow>['onHover']
    selected?: boolean
    onClick: () => void
}
const SpotlightCustomerRow = ({
    item,
    onCloseModal,
    id,
    index,
    onHover,
    selected,
    onClick,
}: SpotlightCustomerRowProps) => {
    const phoneNumber = useMemo(
        () =>
            item.channels.find(
                (channel) => channel.type === TicketChannel.Phone
            )?.address,
        [item.channels]
    )

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
            onHover={onHover}
            selected={selected}
            shrinkInfo
            onClick={onClick}
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
