import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {StoreConfiguration} from 'models/aiAgent/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import Button from 'pages/common/components/button/Button'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import history from 'pages/history'
import {getHasAutomate} from 'state/billing/selectors'

import {FormValues, UpdateValue} from '../../types'
import css from './AiAgentPreviewModeSection.less'

type Props = {
    updateValue: UpdateValue<FormValues>
    aiAgentMode: string
    storeConfiguration?: StoreConfiguration
    aiAgentTicketViewId: number | null
    isFollowUpAiAgentPreviewModeEnabled: boolean
}

export const AIAgentPreviewModeSection = ({
    updateValue,
    aiAgentMode,
    storeConfiguration,
    aiAgentTicketViewId,
    isFollowUpAiAgentPreviewModeEnabled,
}: Props) => {
    const hasAutomate = useAppSelector(getHasAutomate)

    const handleAiAgentTrialModeChange = (value: string) => {
        const date = new Date().toISOString()
        switch (value) {
            case 'enabled':
                updateValue('deactivatedDatetime', null)
                updateValue('chatChannelDeactivatedDatetime', null)
                updateValue('emailChannelDeactivatedDatetime', null)
                updateValue('trialModeActivatedDatetime', null)
                updateValue('previewModeActivatedDatetime', null)
                break

            case 'trial':
                updateValue('deactivatedDatetime', null)
                // We don't support trial mode in chat
                updateValue('chatChannelDeactivatedDatetime', date)
                updateValue('emailChannelDeactivatedDatetime', null)

                updateValue('trialModeActivatedDatetime', date)
                updateValue('previewModeActivatedDatetime', date)
                break

            case 'disabled':
                updateValue('deactivatedDatetime', date)
                updateValue('chatChannelDeactivatedDatetime', date)
                updateValue('emailChannelDeactivatedDatetime', date)
                updateValue('trialModeActivatedDatetime', null)
                updateValue('previewModeActivatedDatetime', null)
                break
        }
    }

    const handleRedirectToAiAgentTicketView = () => {
        if (aiAgentTicketViewId) {
            history.push(`/app/views/${aiAgentTicketViewId}`)
        }
    }

    if (!isFollowUpAiAgentPreviewModeEnabled) {
        return (
            <div className={css.formGroup}>
                <RadioFieldSet
                    name="ai-agent-trial-mode"
                    dataCanduId="ai-agent-trial-mode-toggle"
                    options={[
                        {
                            caption:
                                'Answer customer questions immediately, even outside business hours.',
                            label: 'Directly respond to customers',
                            disabled: !hasAutomate,
                            value: 'enabled',
                        },
                        {
                            caption:
                                'Draft messages for your agents to review and edit before sending. This mode is only available for a limited period of time.',
                            label: 'Draft responses for agents to review before sending',
                            value: 'trial',
                        },
                        {
                            caption: 'AI Agent won’t generate any responses.',
                            label: 'Disabled',
                            value: 'disabled',
                        },
                    ]}
                    selectedValue={aiAgentMode}
                    onChange={(value) => {
                        handleAiAgentTrialModeChange(value)
                    }}
                />
            </div>
        )
    }

    if (storeConfiguration?.trialModeActivatedDatetime) {
        return (
            <AIBanner className={css.banner}>
                <div className={css.bannerWrapper}>
                    <div>
                        <strong>
                            You’re currently using AI Agent Preview.
                        </strong>{' '}
                        Once you’re confident with AI Agent’s responses, set it
                        live!
                    </div>
                    <Button
                        className={css.bannerButton}
                        onClick={handleRedirectToAiAgentTicketView}
                    >
                        Review Drafts
                    </Button>
                </div>
            </AIBanner>
        )
    }

    return null
}
