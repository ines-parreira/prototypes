import React from 'react'

import { PromoCard } from '../../../../common/components/PromoCard'
import type { PromoCardContent } from '../hooks/useShoppingAssistantPromoCard'
import { GMVIcon } from './SharedIcons'

import css from '../../AiAgentNavbar/AiAgentNavbar.less'

interface AdminTrialProgressProps {
    className?: string
    promoContent: PromoCardContent
}

export const AdminTrialProgress: React.FC<AdminTrialProgressProps> = ({
    className,
    promoContent,
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
                                <PromoCard.Text>{progressText}</PromoCard.Text>
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
