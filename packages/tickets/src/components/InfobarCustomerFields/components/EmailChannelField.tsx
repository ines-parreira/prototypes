import { useHistory } from 'react-router-dom'

import { FieldRow } from '@repo/ui'

import { MenuItem, OverflowListItem, SubMenu } from '@gorgias/axiom'
import type {
    TicketCustomer,
    TicketCustomerChannel,
} from '@gorgias/helpdesk-types'

import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { validateChannelField } from '../../../utils/validation'
import { EditableMenuField } from './EditableMenuField'
import { TriggerLabel } from './TriggerLabel'

import css from '../InfobarCustomerFields.less'

type EmailChannelFieldProps = {
    index: number
    customer: TicketCustomer
    channel: TicketCustomerChannel
    onChannelChange: (value: string) => void
    onChannelBlur: (value: string) => void
    onChannelDelete: () => void
    isReadOnly?: boolean
}
export function EmailChannelField({
    index,
    customer,
    channel,
    onChannelChange,
    onChannelBlur,
    onChannelDelete,
    isReadOnly = false,
}: EmailChannelFieldProps) {
    const history = useHistory()
    const { handleTicketDraft } = useTicketsLegacyBridge()
    const { hasDraft, onResumeDraft, onDiscardDraft } = handleTicketDraft
    const createTicketLocation = {
        pathname: `/app/ticket/new`,
        search: `?customer=${customer.id}`,
        state: {
            receiver: {
                name: customer.name || '',
                address: channel.address || '',
            },
            _navigationKey: Date.now(),
        },
    }

    return (
        <OverflowListItem key={channel.id} className={css.overflowListItem}>
            <FieldRow
                fieldId={`email-${channel.id}`}
                label={index === 0 ? 'Email' : null}
            >
                <EditableMenuField
                    id={`email-${channel.id}`}
                    placeholder="+ Add"
                    name="email"
                    ariaLabel="Email"
                    renderTrigger={(value) => (
                        <TriggerLabel
                            label={value}
                            tooltipText="Send email as new ticket"
                            tooltipCaption={value}
                        />
                    )}
                    validator={(value) => validateChannelField('email', value)}
                    value={channel.address || ''}
                    onValueChange={onChannelChange}
                    onBlur={onChannelBlur}
                    onDelete={onChannelDelete}
                    isReadOnly={isReadOnly}
                >
                    {hasDraft ? (
                        <SubMenu label="Send email" leadingSlot="mail">
                            <MenuItem
                                label="A draft ticket already exists"
                                isDisabled
                            />
                            <MenuItem
                                label="Resume draft"
                                onAction={onResumeDraft}
                            />
                            <MenuItem
                                label="Discard and create new ticket"
                                onAction={() =>
                                    onDiscardDraft(createTicketLocation)
                                }
                            />
                        </SubMenu>
                    ) : (
                        <MenuItem
                            label="Send email"
                            leadingSlot="mail"
                            onAction={() => history.push(createTicketLocation)}
                        />
                    )}
                </EditableMenuField>
            </FieldRow>
        </OverflowListItem>
    )
}
