import classNames from 'classnames'
import React, {ComponentProps, useEffect} from 'react'

import {User} from 'config/types/user'
import {RecentItems} from 'hooks/useRecentItems/constants'
import useRecentItems from 'hooks/useRecentItems/useRecentItems'
import {Customer} from 'models/customer/types'
import {VoiceCall, VoiceCallRecordingType} from 'models/voiceCall/types'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {useVoiceRecordingsContext} from 'pages/common/hooks/useVoiceRecordingsContext'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import ControlledCollapsibleDetails from './ControlledCollapsibleDetails'
import TicketVoiceCallAudios from './TicketVoiceCallAudios'
import css from './TicketVoiceCallContainer.less'
import TicketVoiceCallDuration from './TicketVoiceCallDuration'
import TicketVoiceCallSource from './TicketVoiceCallSource'
import TicketVoiceCallSummary from './TicketVoiceCallSummary'

type Props = {
    header: JSX.Element
    user?: User | Customer
    callStatus: JSX.Element | string | null
    dateTime: string
    voiceCall: VoiceCall
    icon: string
    source: Pick<ComponentProps<typeof TicketVoiceCallSource>, 'from' | 'to'>
}

export default function TicketVoiceCallContainer({
    header,
    user,
    callStatus,
    dateTime,
    voiceCall,
    icon,
    source,
}: Props) {
    const {isRecordingOpened, toggleRecordingOpened} =
        useVoiceRecordingsContext()
    const {setRecentItem} = useRecentItems<VoiceCall>(RecentItems.Calls)

    useEffect(() => {
        void setRecentItem(voiceCall)
    }, [setRecentItem, voiceCall])

    return (
        <div className={css.container}>
            <Avatar name={user?.name} size={36} />
            <div className={css.callDetails}>
                <div className={css.row}>
                    <div className={css.header}>
                        {header}
                        <TicketVoiceCallSource
                            icon={icon}
                            id={`source-${voiceCall.id}`}
                            date={dateTime}
                            from={source.from}
                            to={source.to}
                        />
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
                    <ControlledCollapsibleDetails
                        isOpen={isRecordingOpened(voiceCall.id)}
                        setIsOpen={() => {
                            toggleRecordingOpened(voiceCall.id)
                        }}
                        title={
                            <div className={css.audioTitle}>
                                <i className="material-icons">graphic_eq</i>
                                <span>Call Recording</span>
                            </div>
                        }
                    >
                        <TicketVoiceCallAudios
                            voiceCall={voiceCall}
                            type={VoiceCallRecordingType.Recording}
                        />
                    </ControlledCollapsibleDetails>
                )}
                {voiceCall.has_voicemail && (
                    <ControlledCollapsibleDetails
                        isOpen={isRecordingOpened(voiceCall.id)}
                        setIsOpen={() => {
                            toggleRecordingOpened(voiceCall.id)
                        }}
                        title={
                            <div className={css.audioTitle}>
                                <i className="material-icons">voicemail</i>
                                <span>Voicemail left</span>
                            </div>
                        }
                    >
                        <TicketVoiceCallAudios
                            voiceCall={voiceCall}
                            type={VoiceCallRecordingType.Voicemail}
                        />
                    </ControlledCollapsibleDetails>
                )}
                {voiceCall.summaries && (
                    <TicketVoiceCallSummary summaries={voiceCall.summaries} />
                )}
            </div>
        </div>
    )
}
