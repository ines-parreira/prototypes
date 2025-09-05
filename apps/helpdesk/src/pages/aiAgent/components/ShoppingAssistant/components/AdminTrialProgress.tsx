import React from 'react'

import { useEffectOnce } from '@repo/hooks'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import { PromoCard } from 'pages/common/components/PromoCard'

import { PromoCardContent, TrialType } from '../types/ShoppingAssistant'
import { GMVIcon } from './SharedIcons'

import css from '../../AiAgentNavbar/AiAgentNavbar.less'

interface AdminTrialProgressProps {
    className?: string
    promoContent: PromoCardContent
    trialType: TrialType
}

export const AdminTrialProgress: React.FC<AdminTrialProgressProps> = ({
    className,
    promoContent,
    trialType,
}) => {
    const {
        title,
        description,
        shouldShowDescriptionIcon,
        variant,
        primaryButton,
        secondaryButton,
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
                                    <GMVIcon className={css.descriptionIcon} />
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
                                <PromoCard.Text className={css.promoCardText}>
                                    {progressText}
                                </PromoCard.Text>
                            )}
                        </PromoCard.ProgressBar>
                    )}

                    <PromoCard.Actions>
                        <PromoCard.ActionButton
                            label={primaryButton.label}
                            href={primaryButton.href}
                            target={primaryButton.target}
                            onClick={primaryButton.onClick}
                            variant="primary"
                            disabled={primaryButton.disabled}
                            isLoading={primaryButton.isLoading}
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
