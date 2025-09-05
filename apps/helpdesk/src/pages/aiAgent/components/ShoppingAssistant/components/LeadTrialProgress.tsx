import React from 'react'

import { useEffectOnce } from '@repo/hooks'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import { PromoCard } from 'pages/common/components/PromoCard'

import { PromoCardContent, TrialType } from '../types/ShoppingAssistant'
import { GMVIcon, NotificationIcon } from './SharedIcons'

import css from '../../AiAgentNavbar/AiAgentNavbar.less'

interface LeadTrialProgressProps {
    className?: string
    promoContent: PromoCardContent
    trialType: TrialType
}

export const LeadTrialProgress: React.FC<LeadTrialProgressProps> = ({
    className,
    promoContent,
    trialType,
}) => {
    const {
        title,
        description,
        shouldShowDescriptionIcon,
        variant,
        shouldShowNotificationIcon,
        primaryButton,
        showProgressBar,
        progressPercentage,
        progressText,
    } = promoContent

    useEffectOnce(() => {
        logEvent(SegmentEvent.TrialBannerSettingsViewed, {
            trialType,
        })
    })

    return (
        <div className={css.promoCardSection}>
            <PromoCard
                className={className}
                data-variant={variant}
                collapsible
                defaultCollapsed={false}
            >
                <PromoCard.Content>
                    <PromoCard.Header>
                        <PromoCard.Title>{title}</PromoCard.Title>
                        {description && (
                            <PromoCard.Description>
                                {shouldShowDescriptionIcon && (
                                    <GMVIcon className="description-icon" />
                                )}
                                {description}
                            </PromoCard.Description>
                        )}
                    </PromoCard.Header>

                    {showProgressBar && progressPercentage !== undefined && (
                        <PromoCard.ProgressBar
                            percentage={progressPercentage}
                            fillColor="linear-gradient(116deg, rgba(235, 139, 76, 0.90) 4.95%, rgba(210, 155, 255, 0.90) 60.81%)"
                        >
                            {progressText && (
                                <PromoCard.Text>{progressText}</PromoCard.Text>
                            )}
                        </PromoCard.ProgressBar>
                    )}
                    <PromoCard.Actions>
                        {primaryButton.label && (
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
                                isLoading={primaryButton.isLoading}
                            />
                        )}
                    </PromoCard.Actions>
                </PromoCard.Content>
            </PromoCard>
        </div>
    )
}
