import React, {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {Link} from 'react-router-dom'
import _intersection from 'lodash/intersection'
import _difference from 'lodash/difference'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {TicketChannel} from 'business/types/ticket'
import {SelfServiceChannelType} from 'pages/automation/common/hooks/useSelfServiceChannels'
import {ChannelLanguage} from 'pages/automation/common/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {WorkflowConfigurationShallow} from '../models/workflowConfiguration.types'
import useWorkflowApi from './useWorkflowApi'

function getChannelLanguageLabel(l: ChannelLanguage): string {
    switch (l) {
        case 'fr-FR':
            return 'French (FR)'
        case 'fr-CA':
            return 'French (CA)'
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
    }
    return 'Unknown'
}

export default function useLanguagesMismatchWarnings(
    channelType: SelfServiceChannelType,
    integrationId: number,
    channelLanguages: ChannelLanguage[]
) {
    const chatLanguageSettingsLink = `/app/settings/channels/gorgias_chat/${integrationId}/appearance`
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

    const {fetchWorkflowConfigurations} = useWorkflowApi()
    const [workflows, setWorkflows] = useState<WorkflowConfigurationShallow[]>(
        []
    )
    useEffect(() => {
        void fetchWorkflowConfigurations().then(setWorkflows)
    }, [fetchWorkflowConfigurations])

    const getLanguagesMismatchWarning = useCallback<
        (
            workflowId: string
        ) => {message: ReactNode; type: 'error' | 'warning'} | void
    >(
        (workflowId: string) => {
            const workflow = workflows.find((w) => w.id === workflowId)
            if (!workflow) return
            // we align the workflow languages with the channel languages
            // for example chat will use nl for Dutch, but the workflow use nl-NL
            const workflowLanguages =
                workflow.available_languages?.map(
                    (wl) =>
                        channelLanguages.find(
                            (cl) => cl === wl.substring(0, cl.length)
                        ) ?? wl
                ) ?? []
            // There is no overlap between the flow language and the channel language.
            if (
                _intersection(channelLanguages, workflowLanguages).length === 0
            ) {
                return {
                    type: 'error',
                    message: (
                        <>
                            This flow is in{' '}
                            {workflowLanguages
                                .map(getChannelLanguageLabel)
                                .join(', ')}
                            , but this channel is in{' '}
                            {channelLanguages
                                .map(getChannelLanguageLabel)
                                .join(', ')}
                            . At least one flow language must match a channel
                            language in order to enable this flow.
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
                            languages. This flow will be displayed only in the{' '}
                            <Link to={channelLanguageSettingsLink}>
                                channel's selected language
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
                            You have not added a version of this flow in{' '}
                            {extraChannelLanguages
                                .map(getChannelLanguageLabel)
                                .join(', ')}
                            . This flow will be hidden from customers using the{' '}
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
                            For customers to see this flow in{' '}
                            {extraWorkflowLanguages
                                .map(getChannelLanguageLabel)
                                .join(', ')}
                            ,{' '}
                            {extraWorkflowLanguages.length > 1
                                ? 'add them as available languages in'
                                : 'add it as an available language in'}{' '}
                            <Link to={channelLanguageSettingsLink}>
                                this channel's preferences
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
