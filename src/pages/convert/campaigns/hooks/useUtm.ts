import {useEffect, useRef, useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useUpdateChannelConnection} from 'models/convert/channelConnection/queries'
import {ChannelConnection} from 'models/convert/channelConnection/types'

export const useUtm = (
    channelConnection: ChannelConnection | null,
    campaignName: string = ''
) => {
    const campaignNameRef = useRef(campaignName)
    const defaultQueryString =
        campaignName.toLowerCase() !== 'untitled campaign'
            ? `?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=${campaignName}`
            : ''

    const {
        utm_enabled: serverUtmEnabled,
        utm_query_string: serverUtmQueryString,
    } = channelConnection || {
        utm_enabled: undefined,
        utm_query_string: undefined,
    }

    const initialUtmEnabled =
        serverUtmEnabled !== undefined ? serverUtmEnabled : true
    const initialUtmQueryString = serverUtmQueryString || defaultQueryString
    const [utmEnabled, setUtmEnabled] = useState(initialUtmEnabled)
    const [utmQueryString, setUtmQueryString] = useState(initialUtmQueryString)
    const [appliedUtmEnabled, setAppliedUtmEnabled] =
        useState(initialUtmEnabled)
    const [appliedUtmQueryString, setAppliedUtmQueryString] = useState(
        initialUtmQueryString
    )

    useEffect(() => {
        if (campaignNameRef.current !== campaignName && utmQueryString === '') {
            // Should only happen once when the campaign name is initialized
            setUtmQueryString(defaultQueryString)
            setAppliedUtmQueryString(defaultQueryString)
            campaignNameRef.current = campaignName
        }
    }, [defaultQueryString, campaignNameRef, campaignName, utmQueryString])

    useEffect(() => {
        if (serverUtmQueryString) {
            setUtmQueryString(serverUtmQueryString)
            setAppliedUtmQueryString(serverUtmQueryString)
        }
        if (serverUtmEnabled !== undefined) {
            setUtmEnabled(serverUtmEnabled)
            setAppliedUtmEnabled(serverUtmEnabled)
        }
    }, [serverUtmEnabled, serverUtmQueryString])

    const updateChannelConnection = useUpdateChannelConnection()
    const onUtmApply = async (save: boolean = false) => {
        if (channelConnection === null) return

        let closureUtmQueryString = utmQueryString

        if (utmQueryString === defaultQueryString) {
            // If it's empty it's going to be populated with
            // Gorgias default values and populate with
            // the current campaign default name
            closureUtmQueryString = ''
        }

        const data = {
            utm_query_string: closureUtmQueryString,
            utm_enabled: utmEnabled,
        }

        if (save) {
            await updateChannelConnection.mutateAsync([
                undefined,
                {channel_connection_id: channelConnection.id},
                data,
            ])
            channelConnection['utm_query_string'] = data.utm_query_string
            channelConnection['utm_enabled'] = data.utm_enabled
        }

        setAppliedUtmEnabled(utmEnabled)
        setAppliedUtmQueryString(utmQueryString)
        logEvent(SegmentEvent.ConvertUtmApplied, {
            saved: save,
            enabled: utmEnabled,
            value: utmQueryString,
        })
    }

    const onUtmReset = () => {
        setUtmQueryString(defaultQueryString)
    }

    return {
        utmQueryString: utmQueryString,
        onUtmQueryStringChange: (value: string) => setUtmQueryString(value),
        utmEnabled: utmEnabled,
        onUtmEnabledChange: (value: boolean) => setUtmEnabled(value),
        onUtmApply: onUtmApply,
        onUtmReset: onUtmReset,
        appliedUtmQueryString: appliedUtmQueryString,
        appliedUtmEnabled: appliedUtmEnabled,
    }
}
