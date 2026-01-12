import { OverflowListItem } from '@gorgias/axiom'
import type {
    TicketCustomer,
    TicketCustomerChannel,
} from '@gorgias/helpdesk-types'

import {
    formatPhoneNumberInternational,
    validateChannelField,
} from '../../../utils/validation'
import { usePhoneAndSMSIntegrations } from '../hooks/usePhoneAndSMSIntegrations'
import { EditableMenuField } from './EditableMenuField'
import { FieldRow } from './FieldRow'
import { TriggerLabel } from './TriggerLabel'
import { VoiceFieldMenuItems } from './VoiceFieldMenuItems'

import css from '../InfobarCustomerFields.less'

type PhoneChannelFieldProps = {
    index: number
    customer: TicketCustomer
    channel: TicketCustomerChannel
    onChannelChange: (value: string) => void
    onChannelBlur: (value: string) => void
    onChannelDelete: () => void
}

export function PhoneChannelField({
    index,
    customer,
    channel,
    onChannelChange,
    onChannelBlur,
    onChannelDelete,
}: PhoneChannelFieldProps) {
    const { phoneIntegrations, smsIntegrations, phoneNumbers, isLoading } =
        usePhoneAndSMSIntegrations()
    return (
        <OverflowListItem key={channel.id} className={css.overflowListItem}>
            <FieldRow
                fieldId={`phone-${channel.id}`}
                label={index === 0 ? 'Phone' : null}
            >
                <EditableMenuField
                    name="number"
                    placeholder="+ Add"
                    ariaLabel="Phone"
                    value={channel.address || ''}
                    renderTrigger={(value) => (
                        <TriggerLabel
                            label={formatPhoneNumberInternational(value)}
                        />
                    )}
                    validator={(value) => validateChannelField('phone', value)}
                    onValueChange={onChannelChange}
                    onBlur={onChannelBlur}
                    onDelete={onChannelDelete}
                >
                    <VoiceFieldMenuItems
                        phoneAddress={channel.address || ''}
                        customerId={customer.id.toString()}
                        customerName={customer.name || ''}
                        phoneIntegrations={phoneIntegrations}
                        smsIntegrations={smsIntegrations}
                        phoneNumbers={phoneNumbers}
                        isLoading={isLoading}
                    />
                </EditableMenuField>
            </FieldRow>
        </OverflowListItem>
    )
}
