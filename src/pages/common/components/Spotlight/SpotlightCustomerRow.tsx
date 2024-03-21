import React, {ComponentProps} from 'react'
import {Customer} from 'models/customer/types'

import {sanitizeHtmlDefault} from 'utils/html'
import SpotlightRow from './SpotlightRow'
import css from './SpotlightCustomerRow.less'
import {useCustomerHighlightTransform} from './useCustomerHighlightTransform'

export const pickedCustomerFields = ['email', 'id', 'name', 'channels'] as const
export type PickedCustomer = Pick<Customer, typeof pickedCustomerFields[number]>

export type CustomerHighlights = {
    email?: string[]
    name?: string[]
    order_ids?: string[]
    'channels.address'?: string[]
}

type SpotlightCustomerRowProps = {
    item: Customer | PickedCustomer
    onCloseModal: () => void
    id: number
    index: number
    onHover?: ComponentProps<typeof SpotlightRow>['onHover']
    selected?: boolean
    onClick: () => void
    highlight: CustomerHighlights
}
const SpotlightCustomerRow = ({
    item,
    onCloseModal,
    id,
    index,
    onHover,
    selected,
    onClick,
    highlight,
}: SpotlightCustomerRowProps) => {
    const {itemWithHighlights, phoneNumberOrAddress} =
        useCustomerHighlightTransform(highlight, item)

    return (
        <SpotlightRow
            id={id}
            index={index}
            title={
                itemWithHighlights.name || `Customer #${itemWithHighlights.id}`
            }
            info={
                <SpotlightCustomerInfo
                    email={itemWithHighlights.email}
                    phone={phoneNumberOrAddress}
                />
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
            {!!email && (
                <span
                    className={css.infoText}
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtmlDefault(email),
                    }}
                />
            )}
            {!!phone && (
                <>
                    <span className={css.infoSeparator}>•</span>
                    <span
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlDefault(phone),
                        }}
                    />
                </>
            )}
        </div>
    )
}

export default SpotlightCustomerRow
