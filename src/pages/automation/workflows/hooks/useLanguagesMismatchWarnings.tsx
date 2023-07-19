import React, {ReactNode, useCallback, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import _intersection from 'lodash/intersection'
import _difference from 'lodash/difference'
import {TicketChannel} from 'business/types/ticket'
import {FeatureFlagKey} from 'config/featureFlags'

import {SelfServiceChannelType} from 'pages/automation/common/hooks/useSelfServiceChannels'
import {ChannelLanguage} from 'pages/automation/common/types'
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
    const shouldDisplayWarnings = useFlags()[FeatureFlagKey.FlowsMultiLanguages]
    const chatLanguageSettingsLink = `/app/settings/channels/gorgias_chat/${integrationId}/appearance`
    const helpCenterLanguageSettingsLink = `/app/settings/help-center/${integrationId}/preferences`
    const contactFormLanguageSettingsLink = `/app/settings/contact-form/${integrationId}/preferences`
    const channelLanguageSettingsLink =
        channelType === TicketChannel.Chat
            ? chatLanguageSettingsLink
            : channelType === TicketChannel.HelpCenter
            ? helpCenterLanguageSettingsLink
            : contactFormLanguageSettingsLink

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
            if (!shouldDisplayWarnings) return
            const workflow = workflows.find((w) => w.id === workflowId)
            if (!workflow) return
            // There is no overlap between the flow language and the channel language.
            if (
                _intersection(channelLanguages, workflow.available_languages)
                    .length === 0
            ) {
                return {
                    type: 'error',
                    message: (
                        <>
                            This flow is in{' '}
                            {workflow.available_languages
                                ?.map(getChannelLanguageLabel)
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
                [TicketChannel.Chat, TicketChannel.ContactForm].includes(
                    channelType
                ) &&
                (workflow.available_languages ?? []).length >
                    channelLanguages.length
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
                workflow.available_languages ?? []
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
                workflow.available_languages ?? [],
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
            channelLanguages,
            channelType,
            channelLanguageSettingsLink,
            workflows,
            shouldDisplayWarnings,
        ]
    )

    return {getLanguagesMismatchWarning}
}
