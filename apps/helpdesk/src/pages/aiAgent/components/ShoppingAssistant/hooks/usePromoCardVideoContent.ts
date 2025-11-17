import { FeatureFlagKey } from '@repo/feature-flags'

import aiAgentPoster from 'assets/img/pre-trial-banner-ai-agent.png'
import shoppingAssistantPoster from 'assets/img/pre-trial-banner-thumbnail.png'
import shoppingAssistantTrialVideo from 'assets/video/ai-agent-sales-video.mp4'
import aiAgentTrialVideo from 'assets/video/ai-agent-trial-promo.mp4'
import { useFlag } from 'core/flags'

import type { TrialType } from '../types/ShoppingAssistant'

import css from '../../AiAgentNavbar/AiAgentNavbar.less'

const usePromoCardVideoContent = ({
    isAIAgentOnboarded,
    isAiAgentTrial,
}: {
    trialType: TrialType
    isAiAgentTrial: boolean
    isAIAgentOnboarded?: boolean
}) => {
    const isExpandingTrialExperienceMilestone2Enabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceMilestone2,
        false,
    )
    if (isAiAgentTrial) {
        return {
            poster: aiAgentPoster,
            alt: 'AI Agent Demo',
            videoUrl: aiAgentTrialVideo,
            className: css.videoThumbnailAiAgent,
        }
    }

    if (!isExpandingTrialExperienceMilestone2Enabled) {
        return {
            poster: shoppingAssistantPoster,
            alt: 'Shopping Assistant Demo',
            videoUrl: shoppingAssistantTrialVideo,
            className: css.videoThumbnail,
        }
    }
    if (isAIAgentOnboarded === false) {
        return {
            poster: aiAgentPoster,
            alt: 'Shopping Assistant Demo',
            videoUrl: aiAgentTrialVideo,
            className: css.videoThumbnailAiAgent,
        }
    }
    return {
        poster: shoppingAssistantPoster,
        alt: 'Shopping Assistant Demo',
        videoUrl: shoppingAssistantTrialVideo,
        className: css.videoThumbnail,
    }
}

export { usePromoCardVideoContent }
