import React from 'react'
import {fromJS} from 'immutable'
import {isEmpty} from 'lodash'
import classNames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'
import {formatPhoneNumberInternational} from 'pages/phoneNumbers/utils'
import {useCustomerDetails} from 'pages/tickets/detail/components/TicketVoiceCall/hooks'

import useId from 'hooks/useId'
import {CustomerLabel} from '../../utils/labels'
import css from './VoiceCallCustomerLabel.less'

type CustomerLabelProps = {
    customerId: number
    phoneNumber: string
    className?: string
}

export default function VoiceCallCustomerLabel({
    customerId,
    phoneNumber,
    className,
}: CustomerLabelProps) {
    const {customer, error} = useCustomerDetails(customerId)
    const formattedPhoneNumber = formatPhoneNumberInternational(phoneNumber)
    const generatedId = useId()
    const id = `voice-call-customer-label-${generatedId}`

    const displayedValue =
        error || isEmpty(customer) ? formattedPhoneNumber : fromJS(customer)

    const label = <CustomerLabel customer={displayedValue} />

    return (
        <>
            <Tooltip target={id}>{label}</Tooltip>
            <div id={id} className={classNames(css.name, className)}>
                {label}
            </div>
        </>
    )
}
