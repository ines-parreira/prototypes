import React, { useRef, useState } from 'react'

import classNames from 'classnames'

import { Button, CheckBoxField, Tooltip } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useEffectOnce from 'hooks/useEffectOnce'
import {
    ModalBodyWrapper,
    ModalHeaderWrapper,
    ModalWrapper,
} from 'pages/aiAgent/trial/components/ModalWrapper'
import { Separator } from 'pages/common/components/Separator/Separator'

import css from './UpgradePlanModal.less'

export type UpgradePlanModalMode = 'trial' | 'upgrade'

export type PlanDetails = {
    title: string
    description: string
    price: string
    billingPeriod: string
    priceTooltipText?: string
    features: string[]
    buttonText: string
}

export type UpgradePlanModalProps = {
    title: string
    onClose: () => void
    onConfirm: () => void
    onDismiss: () => void
    currentPlan: PlanDetails
    newPlan: PlanDetails
    showTermsCheckbox?: boolean
    isLoading?: boolean
    isTrial?: boolean
}

const PlanSection: React.FC<{
    plan: PlanDetails
    isNewPlan?: boolean
    onButtonClick: () => void
    showTermsCheckbox?: boolean
    isTermsChecked?: boolean
    onTermsChange?: (checked: boolean) => void
    buttonIntent?: 'primary' | 'secondary'
    isLoading?: boolean
    isTrial?: boolean
    hasAttemptedSubmit?: boolean
}> = ({
    plan,
    isNewPlan = false,
    onButtonClick,
    showTermsCheckbox = false,
    isTermsChecked = false,
    onTermsChange,
    buttonIntent = 'primary',
    isLoading = false,
    hasAttemptedSubmit = false,
}) => {
    const tooltipId = `${isNewPlan ? 'new' : 'current'}-plan-price-tooltip`
    const priceContainerRef = useRef<HTMLDivElement>(null)

    const termsLabel = (
        <span className={classNames(css.checkboxLabel)}>
            I agree to the updated pricing and terms associated with this
            upgrade, as outlined in{' '}
            <a
                href="https://www.gorgias.com/legal/terms-of-service"
                target="_blank"
                rel="noreferrer"
                className={
                    isNewPlan && !isTermsChecked && hasAttemptedSubmit
                        ? css.termsLinkError
                        : css.termsLink
                }
            >
                Gorgias terms
            </a>
            .
        </span>
    )

    return (
        <>
            <div className={css.planHeader}>
                <div className={css.title}>{plan.title}</div>
                <div className={css.description}>{plan.description}</div>
            </div>

            <div className={css.priceContainer} ref={priceContainerRef}>
                <div className={css.priceLabel}>{plan.price}</div>
                <div className={css.priceDescription}>
                    / {plan.billingPeriod}
                </div>
                {plan.priceTooltipText && (
                    <>
                        <i
                            id={tooltipId}
                            className={classNames(
                                'material-icons',
                                css.infoIcon,
                            )}
                        >
                            info_outline
                        </i>
                        <Tooltip
                            target={tooltipId}
                            placement="top-start"
                            container={priceContainerRef}
                        >
                            {plan.priceTooltipText}
                        </Tooltip>
                    </>
                )}
            </div>

            <div className={css.checkboxContainer}>
                <Button
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    onClick={onButtonClick}
                    intent={buttonIntent}
                    className={
                        isNewPlan
                            ? css.primaryActionButton
                            : css.secondaryActionButton
                    }
                >
                    {plan.buttonText}
                </Button>

                {showTermsCheckbox && termsLabel && (
                    <div
                        className={!isNewPlan ? css.hiddenCheckbox : undefined}
                    >
                        <CheckBoxField
                            value={isNewPlan ? isTermsChecked : true}
                            onChange={isNewPlan ? onTermsChange! : () => {}}
                            label={termsLabel}
                            className={
                                isNewPlan &&
                                !isTermsChecked &&
                                hasAttemptedSubmit
                                    ? css.checkboxFieldError
                                    : css.checkboxField
                            }
                        />
                    </div>
                )}
            </div>

            <Separator />

            <div className={css.features}>
                {plan.features.map((feature, index) => (
                    <FeatureItem
                        key={`${plan.title}-feature-${index}`}
                        feature={feature}
                    />
                ))}
            </div>
        </>
    )
}

const FeatureItem: React.FC<{ feature: string }> = ({ feature }) => (
    <div className={css.feature}>
        <i className={classNames('material-icons', css.checkIcon)}>check</i>
        {feature}
    </div>
)

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
    title,
    onClose,
    onConfirm,
    onDismiss,
    currentPlan,
    newPlan,
    showTermsCheckbox = true,
    isLoading = false,
    isTrial = false,
}) => {
    const canduId = 'upgrade-plan-modal'
    const [isTermsChecked, setIsTermsChecked] = useState(false)
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

    const handleConfirm = () => {
        if (showTermsCheckbox && !isTermsChecked) {
            setHasAttemptedSubmit(true)
            return
        }
        onConfirm()
    }

    useEffectOnce(() => {
        logEvent(SegmentEvent.PricingModalViewed, {
            type: isTrial ? 'Trial' : 'Upgrade',
        })
    })

    return (
        <ModalWrapper isOpen size="lg" toggle={onClose} fade centered>
            <ModalHeaderWrapper withoutBorder toggle={onClose}>
                {title}
            </ModalHeaderWrapper>
            <ModalBodyWrapper className={css.modalBody} data-candu-id={canduId}>
                <div className={css.newPlan}>
                    <PlanSection
                        plan={newPlan}
                        isNewPlan
                        onButtonClick={handleConfirm}
                        showTermsCheckbox={showTermsCheckbox}
                        isTermsChecked={isTermsChecked}
                        onTermsChange={setIsTermsChecked}
                        isLoading={isLoading}
                        isTrial={isTrial}
                        hasAttemptedSubmit={hasAttemptedSubmit}
                    />
                </div>
                <div className={css.currentPlan}>
                    <PlanSection
                        plan={currentPlan}
                        onButtonClick={onDismiss}
                        showTermsCheckbox={showTermsCheckbox}
                        buttonIntent="secondary"
                    />
                </div>
            </ModalBodyWrapper>
        </ModalWrapper>
    )
}
