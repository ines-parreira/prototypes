import React from 'react'

import preTrialBannerAiAgentThumbnail from 'assets/img/pre-trial-banner-ai-agent.png'
import preTrialBannerThumbnail from 'assets/img/pre-trial-banner-thumbnail.png'
import aiAgentPreviewVideo from 'assets/video/ai-agent-sales-video.mp4'
import aiAgentTrialPromoVideo from 'assets/video/ai-agent-trial-promo.mp4'
import { PromoCard } from 'pages/common/components/PromoCard'

import { PromoCardContent, TrialType } from '../types/ShoppingAssistant'
import { NotificationIcon } from './SharedIcons'

import css from '../../AiAgentNavbar/AiAgentNavbar.less'

interface AdminTrialProps {
    className?: string
    promoContent: PromoCardContent
    trialType: TrialType
    storageKey?: string
}

export const AdminTrial: React.FC<AdminTrialProps> = ({
    className,
    promoContent,
    trialType,
    storageKey,
}) => {
    const {
        title,
        description,
        variant,
        showVideo,
        shouldShowNotificationIcon,
        primaryButton,
        secondaryButton,
        videoModalButton,
    } = promoContent

    const isAiAgentTrial = trialType === TrialType.AiAgent

    return (
        <div className={css.promoCardSection}>
            <PromoCard
                className={className}
                data-variant={variant}
                dismissible={isAiAgentTrial}
                storageKey={storageKey}
            >
                {showVideo && (
                    <PromoCard.Media
                        style={{
                            background:
                                'linear-gradient(296deg, rgba(210, 155, 255, 0.10) 29.82%, rgba(235, 139, 76, 0.10) 63.34%)',
                        }}
                    >
                        <PromoCard.VideoThumbnail
                            poster={
                                isAiAgentTrial
                                    ? preTrialBannerAiAgentThumbnail
                                    : preTrialBannerThumbnail
                            }
                            alt={
                                isAiAgentTrial
                                    ? 'AI Agent Demo'
                                    : 'Shopping Assistant Demo'
                            }
                            // TODO: Add condition for AI Agent video url
                            videoUrl={
                                isAiAgentTrial
                                    ? aiAgentTrialPromoVideo
                                    : aiAgentPreviewVideo
                            }
                            className={
                                isAiAgentTrial
                                    ? css.videoThumbnailAiAgent
                                    : css.videoThumbnail
                            }
                        />

                        <PromoCard.VideoModal
                            videoUrl={
                                isAiAgentTrial
                                    ? aiAgentTrialPromoVideo
                                    : aiAgentPreviewVideo
                            }
                            ctaButton={
                                videoModalButton
                                    ? {
                                          ...videoModalButton,
                                          Icon: shouldShowNotificationIcon
                                              ? NotificationIcon
                                              : undefined,
                                          variant: 'secondary',
                                          className: css.videoModalCTA,
                                      }
                                    : undefined
                            }
                        />
                    </PromoCard.Media>
                )}

                <PromoCard.Content>
                    <PromoCard.Header>
                        <PromoCard.Title>{title}</PromoCard.Title>
                        {description && (
                            <PromoCard.Description>
                                {description}
                            </PromoCard.Description>
                        )}
                    </PromoCard.Header>

                    <PromoCard.Actions>
                        <PromoCard.ActionButton
                            label={primaryButton.label}
                            Icon={
                                shouldShowNotificationIcon
                                    ? NotificationIcon
                                    : undefined
                            }
                            href={primaryButton.href}
                            target={primaryButton.target}
                            onClick={primaryButton.onClick}
                            variant="primary"
                            disabled={primaryButton.disabled}
                        />
                        {secondaryButton && (
                            <PromoCard.ActionButton
                                label={secondaryButton.label}
                                href={secondaryButton.href}
                                target={secondaryButton.target}
                                onClick={secondaryButton.onClick}
                                variant="ghost"
                                disabled={secondaryButton.disabled}
                            />
                        )}
                    </PromoCard.Actions>
                </PromoCard.Content>
            </PromoCard>
        </div>
    )
}
