import React from 'react'

import classNames from 'classnames'

import { Icon, Tag } from '@gorgias/axiom'
import type { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { isLiveCallRinging } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import css from 'domains/reporting/pages/voice/components/VoiceCallActivity/VoiceCallActivity.less'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { isInboundVoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { isFinalVoiceCallStatus } from 'models/voiceCall/utils'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import { AgentLabel, CustomerLabel } from 'pages/common/utils/labels'

type Props = {
    voiceCall: VoiceCallSummary
}

const UNKNOWN_AGENT = 'Unknown agent'

const InboundVoiceCallActivity = ({ voiceCall }: Props) => {
    return (
        <div className={css.callActivityContainer}>
            <i className={classNames('material-icons', css.phoneIcon)}>
                call_received
            </i>
            {voiceCall.customerId ? (
                <VoiceCallCustomerLabel
                    customerId={voiceCall.customerId}
                    phoneNumber={voiceCall.phoneNumberSource}
                    className={classNames(css.customerLabel, {
                        [css.hasAgent]: !!voiceCall.agentId,
                    })}
                    withTooltip={true}
                    customerName={voiceCall.customerName}
                />
            ) : (
                <CustomerLabel
                    customer={
                        voiceCall.customerName ?? voiceCall.phoneNumberSource
                    }
                />
            )}
            {voiceCall.isPossibleSpam && (
                <span className={css.maybeSpamTag}>
                    <Tag
                        leadingSlot={<Icon name={'triangle-warning'} />}
                        color={'orange'}
                    >
                        Maybe spam
                    </Tag>
                </span>
            )}
            <div className={css.action}>
                {getActionLabel(voiceCall.status, voiceCall.agentId)}
            </div>

            {!!voiceCall.agentId && (
                <div className={css.agent}>
                    <VoiceCallAgentLabel
                        agentId={voiceCall.agentId}
                        phoneNumber={
                            voiceCall.phoneNumberDestination ?? UNKNOWN_AGENT
                        }
                        semibold
                        withTooltip
                    />
                </div>
            )}
        </div>
    )
}

const OutboundVoiceCallActivity = ({ voiceCall }: Props) => {
    const unknownAgent = voiceCall.phoneNumberSource ?? UNKNOWN_AGENT

    return (
        <div className={css.callActivityContainer}>
            <i className={classNames('material-icons', css.phoneIcon)}>
                call_made
            </i>
            <span className={css.agent}>
                {voiceCall.agentId ? (
                    <VoiceCallAgentLabel
                        agentId={voiceCall.agentId}
                        phoneNumber={unknownAgent}
                        withTooltip={true}
                    />
                ) : (
                    <AgentLabel
                        className={css.agentLabel}
                        name={unknownAgent}
                    />
                )}
            </span>
            <div className={css.action}>
                {getActionLabel(voiceCall.status, voiceCall.agentId)}
            </div>

            {voiceCall.customerId ? (
                <VoiceCallCustomerLabel
                    customerId={voiceCall.customerId}
                    customerName={voiceCall.customerName}
                    phoneNumber={voiceCall.phoneNumberDestination}
                    className={css.customerLabel}
                    withTooltip
                />
            ) : (
                <CustomerLabel
                    customer={
                        voiceCall.customerName ??
                        voiceCall.phoneNumberDestination
                    }
                />
            )}
        </div>
    )
}

export default function VoiceCallActivity({ voiceCall }: Props) {
    return (
        <div>
            {isInboundVoiceCallSummary(voiceCall) ? (
                <InboundVoiceCallActivity voiceCall={voiceCall} />
            ) : (
                <OutboundVoiceCallActivity voiceCall={voiceCall} />
            )}
        </div>
    )
}

const getActionLabel = (status: VoiceCallStatus, calleeId: number | null) => {
    const isCallRinging = isLiveCallRinging(status)
    const isFinalStatus = isFinalVoiceCallStatus(status)

    if (isCallRinging && !calleeId) {
        return ''
    }

    if (isCallRinging && calleeId) {
        return 'calling'
    }

    if (!isFinalStatus && calleeId) {
        return 'on call with'
    }

    if (isFinalStatus) {
        return 'called'
    }

    return ''
}
