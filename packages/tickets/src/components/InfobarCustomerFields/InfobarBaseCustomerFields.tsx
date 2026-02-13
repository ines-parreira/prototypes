import cn from 'classnames'

import { OverflowListItem, Text } from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { validateChannelField } from '../../utils/validation'
import { EditableField } from './components/EditableField'
import { EmailChannelField } from './components/EmailChannelField'
import { FieldRow } from './components/FieldRow'
import { OtherChannelField } from './components/OtherChannelField'
import { PhoneChannelField } from './components/PhoneChannelField'
import {
    useBaseCustomerFields,
    useCustomerLocalTime,
    useCustomerLocation,
} from './hooks'

import css from './InfobarCustomerFields.less'

interface InfobarBaseCustomerFieldsProps {
    customer: TicketCustomer
    ticketId?: string
}

export function InfobarBaseCustomerFields({
    customer,
    ticketId,
}: InfobarBaseCustomerFieldsProps) {
    const {
        emailChannels,
        phoneChannels,
        otherChannels,
        handleChannelChange,
        updateChannel,
        createChannel,
        deleteChannel,
        fields,
        setFields,
        note,
        setNote,
        handleNoteBlur,
    } = useBaseCustomerFields({ ticketId, customer })

    const { location } = useCustomerLocation(customer)

    const localTime = useCustomerLocalTime(customer)

    return (
        <>
            <OverflowListItem className={css.overflowListItem}>
                <FieldRow fieldId="note-field" label="Note">
                    <EditableField
                        id="note-field"
                        value={note}
                        onValueChange={setNote}
                        onBlur={handleNoteBlur}
                        placeholder="+ Add"
                        ariaLabel="Note"
                        type="textarea"
                        showTooltip
                    />
                </FieldRow>
            </OverflowListItem>
            {location && (
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Location" className={css.infoFieldRow}>
                        <Text
                            size="sm"
                            overflow="ellipsis"
                            className={cn(css.fieldValue, css.infoFieldValue)}
                        >
                            {location}
                        </Text>
                    </FieldRow>
                </OverflowListItem>
            )}
            {localTime && (
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow label="Local time" className={css.infoFieldRow}>
                        <Text
                            size="sm"
                            overflow="ellipsis"
                            className={cn(css.fieldValue, css.infoFieldValue)}
                        >
                            {localTime}
                        </Text>
                    </FieldRow>
                </OverflowListItem>
            )}
            {phoneChannels.length > 0 ? (
                phoneChannels.map((channel, index) => (
                    <PhoneChannelField
                        index={index}
                        key={channel.id}
                        customer={customer}
                        channel={channel}
                        onChannelChange={(value) =>
                            handleChannelChange(channel.id, value)
                        }
                        onChannelBlur={(value) =>
                            updateChannel(channel.id, value)
                        }
                        onChannelDelete={() => deleteChannel(channel.id)}
                    />
                ))
            ) : (
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow fieldId="custom-phone-field" label="Phone">
                        <EditableField<string>
                            id="custom-phone-field"
                            value={fields.phone}
                            onValueChange={(value) =>
                                setFields((prevFields) => ({
                                    ...prevFields,
                                    phone: value,
                                }))
                            }
                            onBlur={(value) => createChannel('phone', value)}
                            placeholder="+ Add"
                            validator={(value) =>
                                validateChannelField('phone', value)
                            }
                            ariaLabel="Phone"
                        />
                    </FieldRow>
                </OverflowListItem>
            )}
            {emailChannels.length > 0 ? (
                emailChannels.map((channel, index) => (
                    <EmailChannelField
                        index={index}
                        key={channel.id}
                        customer={customer}
                        channel={channel}
                        onChannelChange={(value) =>
                            handleChannelChange(channel.id, value)
                        }
                        onChannelBlur={(value) =>
                            updateChannel(channel.id, value)
                        }
                        onChannelDelete={() => deleteChannel(channel.id)}
                    />
                ))
            ) : (
                <OverflowListItem className={css.overflowListItem}>
                    <FieldRow fieldId="custom-email-field" label="Email">
                        <EditableField<string>
                            id="custom-email-field"
                            value={fields.email}
                            onValueChange={(value) =>
                                setFields((prevFields) => ({
                                    ...prevFields,
                                    email: value,
                                }))
                            }
                            onBlur={(value) => createChannel('email', value)}
                            placeholder="+ Add"
                            validator={(value) =>
                                validateChannelField('email', value)
                            }
                            ariaLabel="Email"
                        />
                    </FieldRow>
                </OverflowListItem>
            )}
            {otherChannels.map((channel, index) => (
                <OtherChannelField
                    key={channel.id}
                    channel={channel}
                    index={index}
                    otherChannels={otherChannels}
                />
            ))}
        </>
    )
}
