import React, { useState } from 'react'

import classNames from 'classnames'

import { Button, CheckBoxField, Tooltip } from '@gorgias/merchant-ui-kit'

import { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './TrialTryModal.less'

export type TrialTryModalProps = {
    title: string
    subtitle: string
    isOpen: boolean
    onClose: () => void
    primaryAction?: {
        label: string
        onClick: () => void
    }
    secondaryAction?: {
        label: string
        onClick: () => void
    }
    showTermsCheckbox?: boolean
    isLoading?: boolean
    currentPlan: PlanDetails
    newPlan: PlanDetails
}

const STATIC_FEATURES = [
    {
        icon: 'check',
        title: 'Today',
        description:
            'Your 14-day trial has started. All features are unlocked, so you can start seeing impact today.',
    },
    {
        icon: 'notifications_none',
        title: 'Day 7',
        description: "We'll remind you when you're halfway through your trial.",
    },
    {
        icon: 'star_outline',
        title: 'Day 14',
        description:
            'Your new AI Agent plan kicks in automatically after the trial so you can keep growing revenue with shopping assistant, unless you cancel during your trial.',
    },
]

const FeatureCard = ({
    icon,
    title,
    description,
    isLast,
}: {
    icon: string
    title: string
    description: string
    isLast: boolean
}) => (
    <div className={css.featureCard}>
        <div className={css.iconContainer}>
            <div className={css.icon}>
                <i className="material-icons" aria-hidden="true">
                    {icon}
                </i>
            </div>
            {!isLast && <div className={css.iconBackground} />}
        </div>
        <div>
            <div className={css.featureTitle}>{title}</div>
            <p>{description}</p>
        </div>
    </div>
)

const TermsCheckbox = ({
    isChecked,
    hasError,
    onChange,
}: {
    isChecked: boolean
    hasError: boolean
    onChange: (val: boolean) => void
}) => (
    <div className={css.termsContainer}>
        <CheckBoxField
            value={isChecked}
            onChange={onChange}
            className={hasError ? css.checkboxFieldError : css.checkboxField}
            label={
                <span className={css.checkboxLabel}>
                    I agree to the updated pricing, which will apply after the
                    14-day free trial ends, as outlined in{' '}
                    <a
                        href="https://www.gorgias.com/legal/terms-of-service"
                        target="_blank"
                        rel="noreferrer"
                        className={
                            hasError ? css.termsLinkError : css.termsLink
                        }
                    >
                        Gorgias terms
                    </a>
                    .
                </span>
            }
        />
    </div>
)

const ActionButtons = ({
    isLoading,
    onPrimaryClick,
    primaryAction,
    secondaryAction,
}: {
    isLoading: boolean
    onPrimaryClick: () => void
    primaryAction?: { label: string; onClick: () => void }
    secondaryAction?: { label: string; onClick: () => void }
}) => (
    <div className={css.actionsContainer}>
        {primaryAction && (
            <Button
                intent="primary"
                onClick={onPrimaryClick}
                className={css.primaryActionButton}
                size="large"
                isDisabled={isLoading}
                isLoading={isLoading}
            >
                {primaryAction.label}
            </Button>
        )}
        {secondaryAction && (
            <Button
                intent="secondary"
                fillStyle="ghost"
                onClick={secondaryAction.onClick}
                size="large"
                isDisabled={isLoading}
            >
                {secondaryAction.label}
            </Button>
        )}
    </div>
)

const PlanPricingSection = ({
    currentPlan,
    newPlan,
}: {
    currentPlan: PlanDetails
    newPlan: PlanDetails
}) => (
    <div className={css.planContainer}>
        <div className={css.planHeader}>
            <div>Current plan</div>
            <div>
                {currentPlan.price} / {currentPlan.billingPeriod}
            </div>
        </div>

        <div className={classNames(css.trialPlan, css.planHeader)}>
            <div>After trial ends</div>
            <div>
                <span className={css.trialPlanPrice}>
                    {newPlan.price} / {newPlan.billingPeriod}
                </span>
                {newPlan.priceTooltipText && (
                    <>
                        <span id="new-plan-price-tooltip">
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.infoIcon,
                                )}
                            >
                                info_outline
                            </i>
                        </span>
                        <Tooltip
                            target="new-plan-price-tooltip"
                            placement="top"
                        >
                            {newPlan.priceTooltipText}
                        </Tooltip>
                    </>
                )}
            </div>
        </div>
    </div>
)

const TrialTryModal = ({
    title,
    subtitle,
    isOpen,
    onClose,
    primaryAction,
    secondaryAction,
    showTermsCheckbox = true,
    isLoading = false,
    currentPlan,
    newPlan,
}: TrialTryModalProps) => {
    const [isTermsChecked, setIsTermsChecked] = useState(false)
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

    const handlePrimaryAction = () => {
        if (showTermsCheckbox && !isTermsChecked) {
            setHasAttemptedSubmit(true)
            return
        }
        primaryAction?.onClick()
    }

    const hasCheckboxError = !isTermsChecked && hasAttemptedSubmit

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="large"
            classNameContent={css.modalContent}
        >
            <ModalBody className={css.body}>
                <div className={css.planDetailsContainer}>
                    <div className={css.titleContainer}>
                        <h2 className={css.title}>{title}</h2>
                        <span className={css.subtitle}>{subtitle}</span>
                    </div>

                    <PlanPricingSection
                        currentPlan={currentPlan}
                        newPlan={newPlan}
                    />

                    {showTermsCheckbox && (
                        <TermsCheckbox
                            isChecked={isTermsChecked}
                            hasError={hasCheckboxError}
                            onChange={setIsTermsChecked}
                        />
                    )}

                    <ActionButtons
                        isLoading={isLoading}
                        onPrimaryClick={handlePrimaryAction}
                        primaryAction={primaryAction}
                        secondaryAction={secondaryAction}
                    />
                </div>

                <div className={css.featureContainer}>
                    {STATIC_FEATURES.map((item, index) => (
                        <FeatureCard
                            key={index}
                            {...item}
                            isLast={index === STATIC_FEATURES.length - 1}
                        />
                    ))}
                </div>
            </ModalBody>
        </Modal>
    )
}

export default TrialTryModal
