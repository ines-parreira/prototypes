import React from 'react'
import classNames from 'classnames'
import {isFinalVoiceCallStatus} from 'models/voiceCall/utils'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import {AgentLabel, CustomerLabel} from 'pages/common/utils/labels'
import {isInboundVoiceCallSummary, VoiceCallSummary} from '../../models/types'

import css from './VoiceCallActivity.less'

type Props = {
    voiceCall: VoiceCallSummary
}

const UNKNOWN_AGENT = 'Unknown agent'

const InboundVoiceCallActivity = ({voiceCall}: Props) => {
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
                />
            ) : (
                <CustomerLabel customer={voiceCall.phoneNumberSource} />
            )}
            <div>
                {isFinalVoiceCallStatus(voiceCall.status)
                    ? 'called'
                    : 'calling'}
            </div>

            {voiceCall.agentId && (
                <div className={css.agent}>
                    <VoiceCallAgentLabel
                        agentId={voiceCall.agentId}
                        phoneNumber={
                            voiceCall.phoneNumberDestination ?? UNKNOWN_AGENT
                        }
                    />
                </div>
            )}
        </div>
    )
}

const OutboundVoiceCallActivity = ({voiceCall}: Props) => {
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
                    />
                ) : (
                    <AgentLabel
                        className={css.agentLabel}
                        name={unknownAgent}
                    />
                )}
            </span>
            <div>
                {isFinalVoiceCallStatus(voiceCall.status)
                    ? 'called'
                    : 'calling'}
            </div>
            {voiceCall.customerId ? (
                <VoiceCallCustomerLabel
                    customerId={voiceCall.customerId}
                    phoneNumber={voiceCall.phoneNumberDestination}
                    className={css.customerLabel}
                />
            ) : (
                <CustomerLabel customer={voiceCall.phoneNumberDestination} />
            )}
        </div>
    )
}

export default function VoiceCallActivity({voiceCall}: Props) {
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
