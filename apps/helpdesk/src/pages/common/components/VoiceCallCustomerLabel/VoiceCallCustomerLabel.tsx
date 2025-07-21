import classNames from 'classnames'
import { fromJS } from 'immutable'
import { isEmpty } from 'lodash'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import { formatPhoneNumberInternational } from 'pages/phoneNumbers/utils'
import { useCustomerDetails } from 'pages/tickets/detail/components/TicketVoiceCall/hooks'

import { CustomerLabel } from '../../utils/labels'

import css from './VoiceCallCustomerLabel.less'

type CustomerLabelProps = {
    customerId: number
    customerName?: string
    phoneNumber: string
    className?: string
    withTooltip?: boolean
}

export default function VoiceCallCustomerLabel({
    customerId,
    customerName,
    phoneNumber,
    className,
    withTooltip = false,
}: CustomerLabelProps) {
    const { customer, error } = useCustomerDetails({
        customerId,
        isEnabled: customerName ? false : true,
    })
    const formattedPhoneNumber = formatPhoneNumberInternational(phoneNumber)
    const generatedId = useId()
    const id = `voice-call-customer-label-${generatedId}`

    const customerDataOrPhoneNumber =
        error || isEmpty(customer) ? formattedPhoneNumber : fromJS(customer)
    const displayedValue = customerName || customerDataOrPhoneNumber

    const label = <CustomerLabel customer={displayedValue} />

    return (
        <>
            {withTooltip && <Tooltip target={id}>{label}</Tooltip>}
            <div id={id} className={classNames(css.name, className)}>
                {label}
            </div>
        </>
    )
}
