import { FeatureFlagKey } from '@repo/feature-flags'
import { history } from '@repo/routing'
import classNames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useFlag } from 'core/flags'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { StoreConfiguration } from 'models/aiAgent/types'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

import type { FormValues, UpdateValue } from '../../types'
import { isPreviewModeActivated } from '../StoreConfigForm/StoreConfigForm.utils'

import css from './AiAgentPreviewModeSection.less'

type Props = {
    updateValue: UpdateValue<FormValues>
    aiAgentMode: string
    storeConfiguration?: StoreConfiguration
    aiAgentPreviewTicketViewId: number | null
    isFollowUpAiAgentPreviewModeEnabled: boolean
    className?: string
}

export const AiAgentPreviewModeSection = ({
    updateValue,
    aiAgentMode,
    storeConfiguration,
    aiAgentPreviewTicketViewId,
    isFollowUpAiAgentPreviewModeEnabled,
    className,
}: Props) => {
    const { hasAccess } = useAiAgentAccess(storeConfiguration?.storeName)
    const isTrialModeAvailable = useFlag(FeatureFlagKey.AiAgentTrialMode)

    const handleAiAgentTrialModeChange = (value: string) => {
        const date = new Date().toISOString()
        switch (value) {
            case 'enabled':
                updateValue('chatChannelDeactivatedDatetime', null)
                updateValue('emailChannelDeactivatedDatetime', null)
                updateValue('trialModeActivatedDatetime', null)
                updateValue('previewModeActivatedDatetime', null)
                break

            case 'trial':
                // We don't support trial mode in chat
                updateValue('chatChannelDeactivatedDatetime', date)
                updateValue('emailChannelDeactivatedDatetime', date)

                updateValue('trialModeActivatedDatetime', date)
                updateValue('previewModeActivatedDatetime', date)
                break

            case 'disabled':
                updateValue('chatChannelDeactivatedDatetime', date)
                updateValue('emailChannelDeactivatedDatetime', date)
                updateValue('trialModeActivatedDatetime', null)
                updateValue('previewModeActivatedDatetime', null)
                break
        }
    }

    if (!isFollowUpAiAgentPreviewModeEnabled) {
        return (
            <div className={classNames(css.formGroup, className)}>
                <RadioFieldSet
                    name="ai-agent-trial-mode"
                    dataCanduId="ai-agent-trial-mode-toggle"
                    options={[
                        {
                            caption:
                                'Answer customer questions immediately, even outside business hours.',
                            label: 'Directly respond to customers',
                            disabled: !hasAccess,
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

    const hasAiAgentTrialEnabled = isPreviewModeActivated({
        isPreviewModeActive: storeConfiguration?.isPreviewModeActive,
        isTrialModeAvailable: isTrialModeAvailable,
        emailChannelDeactivatedDatetime:
            storeConfiguration?.emailChannelDeactivatedDatetime,
        chatChannelDeactivatedDatetime:
            storeConfiguration?.chatChannelDeactivatedDatetime,
        trialModeActivatedDatetime:
            storeConfiguration?.trialModeActivatedDatetime,
        previewModeValidUntilDatetime:
            storeConfiguration?.previewModeValidUntilDatetime,
    })

    if (hasAiAgentTrialEnabled) {
        return (
            <AIBanner className={classNames(css.banner, className)}>
                <div className={css.bannerWrapper}>
                    <div>
                        <strong>
                            You’re currently using AI Agent Preview.
                        </strong>{' '}
                        Once you’re confident with AI Agent’s responses, set it
                        live!
                    </div>
                    {aiAgentPreviewTicketViewId && (
                        <Button
                            className={css.bannerButton}
                            onClick={() => {
                                history.push(
                                    `/app/views/${aiAgentPreviewTicketViewId}`,
                                )
                            }}
                        >
                            Review Drafts
                        </Button>
                    )}
                </div>
            </AIBanner>
        )
    }

    return null
}
