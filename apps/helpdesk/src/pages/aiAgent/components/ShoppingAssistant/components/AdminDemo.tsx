import React from 'react'

import preTrialBannerThumbnail from 'assets/img/pre-trial-banner-thumbnail.png'
import aiAgentPreviewVideo from 'assets/video/ai-agent-sales-video.mp4'
import { PromoCard } from 'pages/common/components/PromoCard'

import { PromoCardContent } from '../types/ShoppingAssistant'
import { NotificationIcon } from './SharedIcons'

import css from '../../AiAgentNavbar/AiAgentNavbar.less'

interface AdminDemoProps {
    className?: string
    promoContent: PromoCardContent
}

export const AdminDemo: React.FC<AdminDemoProps> = ({
    className,
    promoContent,
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

    return (
        <div className={css.promoCardSection}>
            <PromoCard className={className} data-variant={variant}>
                {showVideo && (
                    <PromoCard.Media
                        style={{
                            background:
                                'linear-gradient(296deg, rgba(210, 155, 255, 0.10) 29.82%, rgba(235, 139, 76, 0.10) 63.34%)',
                        }}
                    >
                        <PromoCard.VideoThumbnail
                            poster={preTrialBannerThumbnail}
                            alt="Shopping Assistant Demo"
                            videoUrl={aiAgentPreviewVideo}
                            className={css.videoThumbnail}
                        />

                        <PromoCard.VideoModal videoUrl={aiAgentPreviewVideo}>
                            {videoModalButton && (
                                <PromoCard.ActionButton
                                    label={videoModalButton.label}
                                    Icon={
                                        shouldShowNotificationIcon
                                            ? NotificationIcon
                                            : undefined
                                    }
                                    href={videoModalButton.href}
                                    target={videoModalButton.target}
                                    onClick={videoModalButton.onClick}
                                    variant="secondary"
                                    className={css.videoModalCTA}
                                    disabled={videoModalButton.disabled}
                                />
                            )}
                        </PromoCard.VideoModal>
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
