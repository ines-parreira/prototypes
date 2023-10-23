import React from 'react'
import {fromJS} from 'immutable'
import {isEmpty} from 'lodash'
import {formatPhoneNumberInternational} from 'pages/phoneNumbers/utils'
import {useCustomerDetails} from 'pages/tickets/detail/components/TicketVoiceCall/hooks'

import {CustomerLabel} from '../../utils/labels'
import css from './VoiceCallCustomerLabel.less'

type CustomerLabelProps = {
    customerId: number
    phoneNumber: string
}

export default function VoiceCallCustomerLabel({
    customerId,
    phoneNumber,
}: CustomerLabelProps) {
    const {customer, error} = useCustomerDetails(customerId)
    const formattedPhoneNumber = formatPhoneNumberInternational(phoneNumber)

    return (
        <div className={css.name}>
            <CustomerLabel
                customer={
                    error || isEmpty(customer)
                        ? formattedPhoneNumber
                        : fromJS(customer)
                }
            />
        </div>
    )
}
