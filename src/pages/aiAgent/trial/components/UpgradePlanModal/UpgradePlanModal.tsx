import React, { useRef, useState } from 'react'

import classNames from 'classnames'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

import { Button, CheckBoxField, Tooltip } from '@gorgias/merchant-ui-kit'

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
    currentPlan: PlanDetails
    newPlan: PlanDetails
    showTermsCheckbox?: boolean
}

const PlanSection: React.FC<{
    plan: PlanDetails
    isNewPlan?: boolean
    onButtonClick: () => void
    showTermsCheckbox?: boolean
    isTermsChecked?: boolean
    onTermsChange?: (checked: boolean) => void
    buttonIntent?: 'primary' | 'secondary'
}> = ({
    plan,
    isNewPlan = false,
    onButtonClick,
    showTermsCheckbox = false,
    isTermsChecked = false,
    onTermsChange,
    buttonIntent = 'primary',
}) => {
    const tooltipId = `${isNewPlan ? 'new' : 'current'}-plan-price-tooltip`
    const priceContainerRef = useRef<HTMLDivElement>(null)

    const termsLabel = (
        <span className={css.checkboxLabel}>
            I agree to the updated pricing and terms associated with this
            upgrade, as outlined in{' '}
            <a
                href="https://www.gorgias.com/legal/terms-of-service"
                target="_blank"
                rel="noreferrer"
                className={css.termsLink}
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
                    isDisabled={
                        isNewPlan && showTermsCheckbox && !isTermsChecked
                    }
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
                            className={css.checkboxField}
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
    currentPlan,
    newPlan,
    showTermsCheckbox = true,
}) => {
    const canduId = 'upgrade-plan-modal'
    const [isTermsChecked, setIsTermsChecked] = useState(false)

    return (
        <Modal
            isOpen
            size="lg"
            toggle={onClose}
            fade
            centered
            className={css.modal}
        >
            <ModalHeader toggle={onClose} className={css.modalHeader}>
                {title}
            </ModalHeader>
            <ModalBody className={css.modalBody} data-candu-id={canduId}>
                <div className={css.newPlan}>
                    <PlanSection
                        plan={newPlan}
                        isNewPlan
                        onButtonClick={onConfirm}
                        showTermsCheckbox={showTermsCheckbox}
                        isTermsChecked={isTermsChecked}
                        onTermsChange={setIsTermsChecked}
                    />
                </div>
                <div className={css.currentPlan}>
                    <PlanSection
                        plan={currentPlan}
                        onButtonClick={onClose}
                        showTermsCheckbox={showTermsCheckbox}
                        buttonIntent="secondary"
                    />
                </div>
            </ModalBody>
        </Modal>
    )
}
