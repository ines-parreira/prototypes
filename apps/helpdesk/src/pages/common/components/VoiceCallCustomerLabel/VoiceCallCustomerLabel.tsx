import { useId } from '@repo/hooks'
import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { Tooltip } from '@gorgias/axiom'

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
    interactable?: boolean
    showBothNameAndPhone?: boolean
}

export default function VoiceCallCustomerLabel({
    customerId,
    customerName,
    phoneNumber,
    className,
    withTooltip = false,
    interactable = false,
    showBothNameAndPhone = false,
}: CustomerLabelProps) {
    const { customer, error } = useCustomerDetails({
        customerId,
        isEnabled: customerName ? false : true,
    })
    const formattedPhoneNumber = formatPhoneNumberInternational(phoneNumber)
    const generatedId = useId()
    const id = `voice-call-customer-label-${generatedId}`

    const isFoundCustomerValid = !error && !isEmpty(customer)
    const foundCustomerName = isFoundCustomerValid ? customer?.name : undefined
    const displayedCustomerName = customerName
        ? customerName
        : foundCustomerName

    const shouldAlsoDisplayPhoneNumber =
        showBothNameAndPhone && !!displayedCustomerName

    const label = (
        <CustomerLabel
            customer={displayedCustomerName || formattedPhoneNumber}
        />
    )

    return (
        <>
            {withTooltip && (
                <Tooltip target={id}>
                    {label}
                    {shouldAlsoDisplayPhoneNumber && (
                        <span> ({formattedPhoneNumber})</span>
                    )}
                </Tooltip>
            )}
            <div
                id={id}
                className={classNames(css.name, className, {
                    [css.interactable]: interactable,
                })}
            >
                {label}
                {shouldAlsoDisplayPhoneNumber && (
                    <b> ({formattedPhoneNumber})</b>
                )}
            </div>
        </>
    )
}
