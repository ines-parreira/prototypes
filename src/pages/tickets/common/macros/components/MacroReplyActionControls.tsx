import React, {useCallback, useState, useRef} from 'react'

import {UncontrolledTooltip} from 'reactstrap'

import _upperFirst from 'lodash/upperFirst'

import type {Receiver} from 'state/ticket/utils'

import {TicketMessageSourceType} from 'business/types/ticket'

import ReceiversSelectField from 'pages/tickets/detail/components/ReplyArea/MessageSourceFields/components/ReceiversSelectField'

import css from './MacroReplyActionControls.less'

enum Fields {
    To = 'to',
    Cc = 'cc',
    Bcc = 'bcc',
}

export type onFieldChange = (field: Fields, receivers: string) => void

type MacroReplyActionFieldProps = {
    field: Fields
}

const MacroReplyActionField: React.FC<MacroReplyActionFieldProps> = ({
    field,
    children,
}) => (
    <div className={css.recipient}>
        <span className={css.fieldLabel}>{_upperFirst(field)}:</span>
        {children}
    </div>
)

type MacroReplyActionRecipientProps = {
    tabIndex?: number
    field: Fields
    value?: string
    onChange: onFieldChange
}

const MacroReplyActionRecipient: React.FC<MacroReplyActionRecipientProps> = ({
    tabIndex,
    field,
    value = '',
    onChange,
}) => {
    const [receiverNames, setReceiverNames] = useState<Record<string, string>>(
        {}
    )

    const receivers: Receiver[] = value
        .split(',')
        .filter((address) => address)
        .map((address) => ({address, name: receiverNames[address]}))

    const onReceiversChange = useCallback(
        (receivers: Receiver[]) => {
            const receiverNames = receivers
                .filter(({name}) => name)
                .reduce<Record<string, string>>(
                    (previous, {address, name}) => ({
                        ...previous,
                        [address]: name,
                    }),
                    {}
                )

            setReceiverNames(receiverNames)

            onChange(field, receivers.map(({address}) => address).join(','))
        },
        [field, onChange]
    )

    return (
        <MacroReplyActionField field={field}>
            <ReceiversSelectField
                tabIndex={tabIndex}
                sourceType={TicketMessageSourceType.Email}
                value={receivers}
                onChange={onReceiversChange}
                placeholder={field === Fields.To ? undefined : ''}
                disableSearch={field !== Fields.To}
            />
        </MacroReplyActionField>
    )
}

type MacroReplyActionControlsProps = {
    tabIndex?: number
    fields: {
        [Fields.To]?: string
        [Fields.Cc]?: string
        [Fields.Bcc]?: string
    }
    onShowCcBcc?: () => void
    onChange: onFieldChange
    showCcBccTooltip?: boolean
    className?: string
}

const MacroReplyActionControls: React.FC<MacroReplyActionControlsProps> = ({
    tabIndex,
    fields: {to, cc, bcc},
    onShowCcBcc,
    onChange,
    showCcBccTooltip,
    className,
}) => {
    const [showCc, setShowCc] = useState(!!cc?.length)
    const [showBcc, setShowBcc] = useState(!!bcc?.length)

    const optionalFields = useRef<HTMLDivElement>(null)
    const currentClient = useRef<HTMLSpanElement>(null)

    return (
        <div className={className}>
            <div className={css.wrapper}>
                <div ref={optionalFields} className={css.optionalFields}>
                    {!showCc && (
                        <>
                            <span
                                onClick={() => {
                                    setShowCc(true)
                                    onShowCcBcc && onShowCcBcc()
                                }}
                            >
                                Cc
                            </span>
                            {!showBcc && ' / '}
                        </>
                    )}
                    {!showBcc && (
                        <span
                            onClick={() => {
                                setShowBcc(true)
                                onShowCcBcc && onShowCcBcc()
                            }}
                        >
                            Bcc
                        </span>
                    )}
                </div>
                {showCcBccTooltip && (
                    <UncontrolledTooltip
                        key={String(showCc === showBcc)}
                        target={optionalFields}
                    >
                        Addresses added to Cc/Bcc fields will be automatically
                        applied every time this macro is used.
                    </UncontrolledTooltip>
                )}
                {to === undefined ? (
                    <MacroReplyActionField field={Fields.To}>
                        <span ref={currentClient} className={css.currentClient}>
                            Current client
                        </span>
                        <UncontrolledTooltip target={currentClient}>
                            This is going to be pre-populated depending on the
                            ticket information.
                        </UncontrolledTooltip>
                    </MacroReplyActionField>
                ) : (
                    <MacroReplyActionRecipient
                        tabIndex={tabIndex}
                        field={Fields.To}
                        value={to}
                        onChange={onChange}
                    />
                )}
                {showCc && (
                    <MacroReplyActionRecipient
                        tabIndex={tabIndex}
                        field={Fields.Cc}
                        value={cc}
                        onChange={onChange}
                    />
                )}
                {showBcc && (
                    <MacroReplyActionRecipient
                        tabIndex={tabIndex}
                        field={Fields.Bcc}
                        value={bcc}
                        onChange={onChange}
                    />
                )}
            </div>
        </div>
    )
}

export default MacroReplyActionControls
