import {useFlags} from 'launchdarkly-react-client-sdk'
import _difference from 'lodash/difference'
import _intersection from 'lodash/intersection'
import React, {ReactNode, useCallback, useMemo} from 'react'
import {Link} from 'react-router-dom'

import {TicketChannel} from 'business/types/ticket'
import {FeatureFlagKey} from 'config/featureFlags'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'
import {SelfServiceChannelType} from 'pages/automate/common/hooks/useSelfServiceChannels'
import {ChannelLanguage} from 'pages/automate/common/types'

function getChannelLanguageLabel(l: ChannelLanguage): string {
    switch (l) {
        case 'en-GB':
            return 'English (GB)'
        case 'en-US':
            return 'English (US)'
        case 'fr-FR':
            return 'French (FR)'
        case 'fr-CA':
            return 'French (CA)'
        case 'pt-BR':
            return 'Portuguese (BR)'
    }
    switch (l.slice(0, 2)) {
        case 'en':
            return 'English'
        case 'fr':
            return 'French'
        case 'es':
            return 'Spanish'
        case 'de':
            return 'German'
        case 'nl':
            return 'Dutch'
        // We have cz in chat, without this the warning text will be "...but this channel is in Unknown.."
        case 'cz':
            return 'Czech'
        //AUTEN-3246: We have cs-CZ in flows,  without this the warning text will be "This Flow is in Unknown,..."
        case 'cs':
            return 'Czech'
        case 'da':
            return 'Danish'
        case 'no':
            return 'Norwegian'
        case 'it':
            return 'Italian'
        case 'sv':
            return 'Swedish'
        case 'fi':
            return 'Finnish'
        case 'ja':
            return 'Japanese'
    }
    return 'Unknown'
}

export default function useLanguagesMismatchWarnings(
    channelType: SelfServiceChannelType,
    integrationId: number,
    channelLanguages: ChannelLanguage[]
) {
    const chatLanguageSettingsLink = `/app/settings/channels/gorgias_chat/${integrationId}/preferences`
    const helpCenterLanguageSettingsLink = `/app/settings/help-center/${integrationId}/preferences`
    const contactFormLanguageSettingsLink = `/app/settings/contact-form/${integrationId}/preferences`
    const channelLanguageSettingsLink =
        channelType === TicketChannel.Chat
            ? chatLanguageSettingsLink
            : channelType === TicketChannel.HelpCenter
              ? helpCenterLanguageSettingsLink
              : contactFormLanguageSettingsLink

    const hasChatMultiLanguagesFeatureFlag =
        useFlags()[FeatureFlagKey.ChatMultiLanguages] || false

    const monoLanguageChannels = useMemo(() => {
        return hasChatMultiLanguagesFeatureFlag
            ? [TicketChannel.ContactForm]
            : [TicketChannel.Chat, TicketChannel.ContactForm]
    }, [hasChatMultiLanguagesFeatureFlag])

    const {data: workflows} = useGetWorkflowConfigurations()

    const getLanguagesMismatchWarning = useCallback<
        (
            workflowId: string
        ) => {message: ReactNode; type: 'error' | 'warning'} | void
    >(
        (workflowId: string) => {
            const workflow = workflows?.find((w) => w.id === workflowId)
            if (!workflow) return
            // we align the workflow languages with the channel languages
            // for example chat will use nl for Dutch, but the workflow use nl-NL
            const workflowLanguages =
                workflow.available_languages?.map((wl) =>
                    wl === 'cs-CZ'
                        ? // Handle special case for 'cs-CZ' and 'cz'
                          (channelLanguages.find(
                              (cl) => cl === ('cz' as ChannelLanguage)
                          ) ?? wl)
                        : (channelLanguages.find(
                              (cl) => cl === wl.substring(0, cl.length)
                          ) ?? wl)
                ) ?? []
            // There is no overlap between the flow language and the channel language.
            if (
                _intersection(channelLanguages, workflowLanguages).length === 0
            ) {
                return {
                    type: 'error',
                    message: (
                        <>
                            This Flow is in{' '}
                            {workflowLanguages
                                .map(getChannelLanguageLabel)
                                .join(', ')}
                            , but this channel is in{' '}
                            {channelLanguages
                                .map(getChannelLanguageLabel)
                                .join(', ')}
                            . At least one Flow language must match a channel
                            language in order to enable this Flow.
                            <br />
                            <Link to={channelLanguageSettingsLink}>
                                See channel preferences
                            </Link>
                            .
                        </>
                    ),
                }
            }

            // The channel is mono-language, and there’s overlap between the flow languages and the channel language
            if (
                monoLanguageChannels.includes(channelType) &&
                workflowLanguages.length > channelLanguages.length
            ) {
                return {
                    type: 'warning',
                    message: (
                        <>
                            This channel does not currently support multiple
                            languages. This Flow will be displayed only in the{' '}
                            <Link to={channelLanguageSettingsLink}>
                                {`channel's selected language`}
                            </Link>
                            : {getChannelLanguageLabel(channelLanguages[0])}.
                        </>
                    ),
                }
            }

            // The channel has a language that the flow doesn’t have
            const extraChannelLanguages = _difference(
                channelLanguages,
                workflowLanguages
            )
            if (extraChannelLanguages.length > 0) {
                return {
                    type: 'warning',
                    message: (
                        <>
                            You have not added a version of this Flow in{' '}
                            {extraChannelLanguages
                                .map(getChannelLanguageLabel)
                                .join(', ')}
                            . This Flow will be hidden from customers using the{' '}
                            {extraChannelLanguages
                                .map(getChannelLanguageLabel)
                                .join(', ')}{' '}
                            version of this channel.
                        </>
                    ),
                }
            }

            // If the flow has a language that the channel doesn’t have.
            const extraWorkflowLanguages = _difference(
                workflowLanguages,
                channelLanguages
            )
            if (extraWorkflowLanguages.length > 0) {
                return {
                    type: 'warning',
                    message: (
                        <>
                            For customers to see this Flow in{' '}
                            {extraWorkflowLanguages
                                .map(getChannelLanguageLabel)
                                .join(', ')}
                            ,{' '}
                            {extraWorkflowLanguages.length > 1
                                ? 'add them as available languages in'
                                : 'add it as an available language in'}{' '}
                            <Link to={channelLanguageSettingsLink}>
                                {`this channel's preferences`}
                            </Link>
                            .
                        </>
                    ),
                }
            }
        },
        [
            workflows,
            channelLanguages,
            monoLanguageChannels,
            channelType,
            channelLanguageSettingsLink,
        ]
    )

    return {getLanguagesMismatchWarning}
}
