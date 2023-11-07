import React from 'react'
import classNames from 'classnames'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {User} from 'config/types/user'
import {Customer} from 'models/customer/types'
import {DatetimeLabel} from 'pages/common/utils/labels'

import {VoiceCall, VoiceCallRecordingType} from 'models/voiceCall/types'
import css from './TicketVoiceCallContainer.less'
import TicketVoiceCallDuration from './TicketVoiceCallDuration'
import TicketVoiceCallAudio from './TicketVoiceCallAudio'
import CollapsibleDetails from './CollapsibleDetails'

type Props = {
    header: JSX.Element
    user?: User | Customer
    callStatus: JSX.Element | string | null
    dateTime: string
    voiceCall: VoiceCall
    icon: string
}

export default function TicketVoiceCallContainer({
    header,
    user,
    callStatus,
    dateTime,
    voiceCall,
    icon,
}: Props) {
    return (
        <div className={css.container}>
            <Avatar name={user?.name} size={36} />
            <div className={css.callDetails}>
                <div className={css.row}>
                    <div className={css.header}>
                        {header}
                        <i
                            className={classNames(
                                'material-icons',
                                css.phoneIcon
                            )}
                        >
                            {icon}
                        </i>
                    </div>
                    <DatetimeLabel
                        dateTime={dateTime}
                        className={classNames('text-faded', css.date)}
                        breakDate
                    />
                </div>
                <div className={css.row}>
                    <div className={css.callStatus}>{callStatus}</div>
                    <TicketVoiceCallDuration voiceCall={voiceCall} />
                </div>
                {voiceCall.has_call_recording && (
                    <CollapsibleDetails
                        title={
                            <div className={css.audioTitle}>
                                <i className="material-icons">graphic_eq</i>
                                <span>Call Recording</span>
                            </div>
                        }
                    >
                        <TicketVoiceCallAudio
                            voiceCall={voiceCall}
                            type={VoiceCallRecordingType.Recording}
                        />
                    </CollapsibleDetails>
                )}
                {voiceCall.has_voicemail && (
                    <CollapsibleDetails
                        title={
                            <div className={css.audioTitle}>
                                <i className="material-icons">voicemail</i>
                                <span>Voicemail left</span>
                            </div>
                        }
                    >
                        <TicketVoiceCallAudio
                            voiceCall={voiceCall}
                            type={VoiceCallRecordingType.Voicemail}
                        />
                    </CollapsibleDetails>
                )}
            </div>
        </div>
    )
}
