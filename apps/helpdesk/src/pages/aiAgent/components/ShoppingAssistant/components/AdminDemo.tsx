import type React from 'react'

import { PromoCard } from 'pages/common/components/PromoCard'

import { usePromoCardVideoContent } from '../hooks/usePromoCardVideoContent'
import type { PromoCardContent } from '../types/ShoppingAssistant'
import { TrialType } from '../types/ShoppingAssistant'
import { NotificationIcon } from './SharedIcons'

import css from '../../AiAgentNavbar/AiAgentNavbar.less'

interface AdminDemoProps {
    className?: string
    promoContent: PromoCardContent
    trialType: TrialType
    storageKey?: string
    isOnboarded?: boolean
}

export const AdminDemo: React.FC<AdminDemoProps> = ({
    className,
    promoContent,
    trialType,
    storageKey,
    isOnboarded,
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
    const videoContentConfig = usePromoCardVideoContent({
        trialType,
        isAIAgentOnboarded: isOnboarded,
        isAiAgentTrial,
    })
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
                            poster={videoContentConfig.poster}
                            alt={videoContentConfig.alt}
                            videoUrl={videoContentConfig.videoUrl}
                            className={videoContentConfig.className}
                        />

                        <PromoCard.VideoModal
                            videoUrl={videoContentConfig.videoUrl}
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
