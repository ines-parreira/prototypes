import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'

import { Button, CheckBoxField, Tooltip } from '@gorgias/axiom'

import { useAiAgentUpgradePlan } from 'hooks/aiAgent/useAiAgentUpgradePlan'
import useAppSelector from 'hooks/useAppSelector'
import { useGetTrials } from 'models/aiAgent/queries'
import { PlanDetails } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import {
    hasTrialExpired,
    hasTrialOptedIn,
} from 'pages/aiAgent/trial/utils/utils'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import { formatAmount } from 'pages/settings/new_billing/utils/formatAmount'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import css from './TrialTryModal.less'

export type TrialFeature = {
    icon: string
    title: string
    description: string
}

export type TrialTryModalProps = {
    title: string
    subtitle: string
    isOpen: boolean
    onClose: () => void
    primaryAction?: {
        label: string
        onClick: (optedInForUpgrade?: boolean) => void
        isDisabled?: boolean
        errorMessage?: ReactNode
    }
    secondaryAction?: {
        label: string
        onClick: () => void
    }
    showTermsCheckbox?: boolean
    isLoading?: boolean
    currentPlan: PlanDetails | null
    newPlan: PlanDetails
    features: TrialFeature[]
}

const FeatureCard = ({
    icon,
    title,
    description,
    isLast,
}: TrialFeature & {
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
    isDisabled,
    hasError,
    onChange,
}: {
    isChecked: boolean
    isDisabled: boolean
    hasError: boolean
    onChange: (val: boolean) => void
}) => (
    <div className={css.termsContainer}>
        <CheckBoxField
            value={isChecked}
            onChange={onChange}
            isDisabled={isDisabled}
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
    primaryAction?: {
        label: string
        onClick: () => void
        isDisabled?: boolean
        errorMessage?: ReactNode
    }
    secondaryAction?: { label: string; onClick: () => void }
}) => (
    <div className={css.actionsContainer}>
        {primaryAction && (
            <>
                <Button
                    intent="primary"
                    onClick={onPrimaryClick}
                    className={css.primaryActionButton}
                    size="large"
                    isDisabled={isLoading || primaryAction.isDisabled}
                    isLoading={isLoading}
                >
                    {primaryAction.label}
                </Button>
                {primaryAction.errorMessage && primaryAction.isDisabled && (
                    <div className={css.primaryActionError}>
                        {primaryAction.errorMessage}
                    </div>
                )}
            </>
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
    currentPlan: PlanDetails | null
    newPlan: PlanDetails
}) => (
    <div className={css.planContainer}>
        {!!currentPlan ? (
            <div className={css.planHeader}>
                <div>Current plan</div>
                <div>
                    {currentPlan.price} / {currentPlan.billingPeriod}
                </div>
            </div>
        ) : (
            <div className={classNames(css.trialPlan, css.planHeader)}>
                <div>Today</div>
                <div>{formatAmount(0, newPlan.currency)}</div>
            </div>
        )}

        <div
            className={classNames(css.planHeader, {
                [css.trialPlan]: !!currentPlan,
            })}
        >
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
    features,
}: TrialTryModalProps) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { data: trials, isLoading: isTrialsLoading } =
        useGetTrials(accountDomain)

    const { data: upgradePlanData, isLoading: upgradePlanDataLoading } =
        useAiAgentUpgradePlan(accountDomain)

    const hasAnyOptedInTrial = !!trials?.some(
        (trial) => hasTrialOptedIn(trial) && !hasTrialExpired(trial),
    )

    const [isTermsManuallyChecked, setTermsManuallyChecked] = useState(false)

    // If there is at least one opted-in trial (and not expired) then terms
    // are checked and they cannot be unchecked
    const isTermsChecked = hasAnyOptedInTrial || isTermsManuallyChecked
    const isTermsDisabled = hasAnyOptedInTrial

    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
    const handlePrimaryAction = useCallback(() => {
        if (primaryAction?.isDisabled) {
            return
        }
        if (showTermsCheckbox && !isTermsChecked) {
            setHasAttemptedSubmit(true)
            return
        }
        primaryAction?.onClick(isTermsChecked)
    }, [primaryAction, showTermsCheckbox, isTermsChecked])

    const hasCheckboxError = !isTermsChecked && hasAttemptedSubmit

    useEffect(() => {
        if (!isOpen) {
            setTermsManuallyChecked(false)
            setHasAttemptedSubmit(false)
        }
    }, [isOpen])

    const hasUpgradePlan = upgradePlanData && !upgradePlanDataLoading

    const planSection = useMemo(() => {
        if (hasUpgradePlan) {
            return (
                <>
                    <PlanPricingSection
                        currentPlan={currentPlan}
                        newPlan={newPlan}
                    />

                    {showTermsCheckbox && (
                        <TermsCheckbox
                            isChecked={isTermsChecked}
                            isDisabled={isTermsDisabled}
                            hasError={hasCheckboxError}
                            onChange={setTermsManuallyChecked}
                        />
                    )}
                </>
            )
        }

        return (
            <div className={css.contactUsContainer}>
                <p>
                    <strong>
                        Please get in touch with our team to start your free
                        trial.
                    </strong>
                </p>
            </div>
        )
    }, [
        hasUpgradePlan,
        currentPlan,
        newPlan,
        showTermsCheckbox,
        isTermsChecked,
        isTermsDisabled,
        hasCheckboxError,
    ])

    const actionButtons = useMemo(() => {
        const actions = hasUpgradePlan
            ? {
                  primaryAction,
                  secondaryAction,
              }
            : {
                  primaryAction: primaryAction
                      ? {
                            ...primaryAction,
                            isDisabled: true,
                        }
                      : undefined,
                  secondaryAction,
              }

        return (
            <ActionButtons
                isLoading={isLoading}
                onPrimaryClick={handlePrimaryAction}
                primaryAction={actions.primaryAction}
                secondaryAction={actions.secondaryAction}
            />
        )
    }, [
        hasUpgradePlan,
        primaryAction,
        secondaryAction,
        isLoading,
        handlePrimaryAction,
    ])

    if (isTrialsLoading) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="huge"
            classNameContent={css.modalContent}
        >
            <ModalBody className={css.body}>
                <div className={css.planDetailsContainer}>
                    <div className={css.titleContainer}>
                        <h2 className={css.title}>{title}</h2>
                        <span className={css.subtitle}>{subtitle}</span>
                    </div>

                    {planSection}

                    {actionButtons}
                </div>

                <div className={css.featureContainer}>
                    {features.map((item, index) => (
                        <FeatureCard
                            key={index}
                            {...item}
                            isLast={index === features.length - 1}
                        />
                    ))}
                </div>
            </ModalBody>
        </Modal>
    )
}

export default TrialTryModal
