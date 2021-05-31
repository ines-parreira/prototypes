import React, {ReactNode} from 'react'
import {Map} from 'immutable'

import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'

export default function Campaign() {
    return {
        TitleWrapper,
    }
}

type TitleWrapperProps = {
    children: ReactNode | null
    source: Map<string, string>
}

const TitleWrapper = (props: TitleWrapperProps) => {
    const {children, source} = props

    const link = `https://www.klaviyo.com/campaign/${source.get(
        'id'
    )}/reports/overview`
    const status: string = source.get('status_label')
    const schedule_time: string = source.get('send_time')

    return (
        <>
            <a href={link} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
            <CardHeaderDetails>
                <CardHeaderValue label="Status">{status}</CardHeaderValue>
                <CardHeaderValue label="Scheduled">
                    {schedule_time}
                </CardHeaderValue>
            </CardHeaderDetails>
        </>
    )
}
