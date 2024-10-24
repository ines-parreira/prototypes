import {useFlags} from 'launchdarkly-react-client-sdk'
import _ from 'lodash'
import React, {useCallback, useMemo} from 'react'

import {TicketChannel} from 'business/types/ticket'
import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {getLanguagesFromChatConfig} from 'config/integrations/gorgias_chat'
import {MAX_ACTIVE_FLOWS} from 'pages/automate/common/components/constants'
import {
    SelfServiceChannel,
    SelfServiceChannelType,
} from 'pages/automate/common/hooks/useSelfServiceChannels'
import {ChannelLanguage} from 'pages/automate/common/types'
import useLanguagesMismatchWarnings from 'pages/automate/workflows/hooks/useLanguagesMismatchWarnings'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import ToggleInput from 'pages/common/forms/ToggleInput'

import ChannelWarning from '../helper/ChannelWarning'
import css from '../WorkflowsPublisher.less'

const getChannelLanguages = (
    channel: SelfServiceChannel
): ChannelLanguage[] => {
    switch (channel.type) {
        case TicketChannel.Chat:
            return getLanguagesFromChatConfig(
                channel.value.meta
            ) as ChannelLanguage[]
        case TicketChannel.HelpCenter:
            return channel.value.supported_locales
        case TicketChannel.ContactForm:
            return [channel.value.default_locale]
    }
    return []
}

type Workflow = {id?: string; workflow_id?: string; enabled: boolean}

type Props = {
    channel: SelfServiceChannel
    isLoading: boolean
    workflows: Workflow[]
    handleAutomationSettingUpdate: (workflows: Workflow[]) => void
    onlySupportedChannels: SelfServiceChannelType[]
    configuration: WorkflowConfiguration
}
const ChannelToggle = ({
    channel,
    workflows,
    isLoading,
    handleAutomationSettingUpdate,
    onlySupportedChannels,
    configuration,
}: Props) => {
    const toggleId = `channel-toggle-${channel.type}-${channel.value.id}`
    const isChat = TicketChannel.Chat === channel.type
    const idKey = isChat ? 'workflow_id' : 'id'

    const isMLFlowRecommendationEnabled =
        useFlags()[FeatureFlagKey.MLFlowsRecommendation]

    const clonedWorkflows = useMemo(() => {
        return _.cloneDeep(workflows || [])
    }, [workflows])
    const currentFlowIndex = clonedWorkflows.findIndex(
        (entry) => entry[idKey] === configuration.id
    )

    const isWorkflowEnabled =
        currentFlowIndex > -1 && clonedWorkflows[currentFlowIndex]?.enabled

    const {getLanguagesMismatchWarning} = useLanguagesMismatchWarnings(
        channel.type,
        channel.value.id,
        getChannelLanguages(channel)
    )

    const languagesMismatchWarning = getLanguagesMismatchWarning(
        configuration.id
    )

    const isLanguageMismatchError =
        languagesMismatchWarning && languagesMismatchWarning.type === 'error'

    const handleUpdate = useCallback(() => {
        if (currentFlowIndex > -1) {
            clonedWorkflows[currentFlowIndex].enabled = !isWorkflowEnabled
        } else {
            clonedWorkflows.push({
                [idKey]: configuration.id,
                enabled: true,
            })
        }
        logEvent(SegmentEvent.AutomateChannelUpdateFromFlows, {
            page: 'Workflows',
        })
        handleAutomationSettingUpdate(clonedWorkflows)
    }, [
        currentFlowIndex,
        handleAutomationSettingUpdate,
        clonedWorkflows,
        isWorkflowEnabled,
        idKey,
        configuration.id,
    ])
    const maxWorkflowsLimitReached = useMemo(() => {
        const enabledFlowsCount = clonedWorkflows.filter(
            (workflow) => workflow.enabled
        ).length
        if (isChat) {
            if (isMLFlowRecommendationEnabled) return false
            return enabledFlowsCount >= MAX_ACTIVE_FLOWS
        }
        return enabledFlowsCount >= MAX_ACTIVE_FLOWS
    }, [clonedWorkflows, isChat, isMLFlowRecommendationEnabled])

    return (
        <div>
            <ToggleInput
                id={toggleId}
                className={css.channelToggle}
                name={channel.value.name}
                isToggled={isWorkflowEnabled}
                isLoading={isLoading}
                onClick={handleUpdate}
                isDisabled={
                    (!!onlySupportedChannels.length ||
                        isLanguageMismatchError ||
                        maxWorkflowsLimitReached) &&
                    !isWorkflowEnabled
                }
            >
                <div className={css.channelLabel}>
                    <div>{channel.value.name} </div>
                    {
                        <ChannelWarning
                            maxWorkflowsLimitReached={maxWorkflowsLimitReached}
                            channel={channel}
                            toggleId={toggleId}
                            isWorkflowEnabled={isWorkflowEnabled}
                            onlySupportedChannels={onlySupportedChannels}
                            missMatchMessage={
                                languagesMismatchWarning &&
                                languagesMismatchWarning.message
                            }
                        />
                    }
                </div>
            </ToggleInput>
        </div>
    )
}
export default ChannelToggle
