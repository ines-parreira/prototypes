import React from 'react'

import { Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'

import css from './TrialFinishSetupModal.less'

const STATIC_FEATURES = [
    {
        icon: 'check',
        title: 'Shopping Assistant features are now live!',
        description:
            'All features are unlocked, so you can start seeing impact today.',
    },
    {
        icon: '',
        title: 'Turn on customer engagement tools',
        description:
            'Proactively engage with visitors and instantly drive meaningful conversations.',
        benefit: 'Brands that enable this see 15% more sales',
    },
    {
        icon: '',
        title: 'Set up discount strategy',
        description: 'Offer smart discounts to maximize conversions.',
        benefit: 'Reduce cart abandonment with timely offers',
    },
]

export type TrialFinishSetupModalProps = {
    title: string
    subtitle: string
    content: string
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
    isLoading?: boolean
}

const ActionButtons = ({
    isLoading,
    primaryAction,
    secondaryAction,
}: {
    isLoading: boolean
    primaryAction?: { label: string; onClick: () => void }
    secondaryAction?: { label: string; onClick: () => void }
}) => (
    <>
        {secondaryAction && (
            <Button
                intent="secondary"
                fillStyle="ghost"
                onClick={secondaryAction.onClick}
                size="medium"
                isDisabled={isLoading}
            >
                {secondaryAction.label}
            </Button>
        )}

        {primaryAction && (
            <Button
                intent="primary"
                onClick={primaryAction.onClick}
                className={css.primaryActionButton}
                size="medium"
                isDisabled={isLoading}
                isLoading={isLoading}
            >
                {primaryAction.label}
            </Button>
        )}
    </>
)

const FeatureCard = ({
    icon,
    title,
    description,
    benefit,
    isLast,
}: {
    icon: string
    title: string
    description: string
    benefit?: string
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
            <div className={css.featureDescription}>{description}</div>
            {benefit && (
                <div className={css.featureBenefit}>
                    <i className="material-icons" aria-hidden="true">
                        bolt
                    </i>
                    {benefit}
                </div>
            )}
        </div>
    </div>
)

const TrialFinishSetupModal = ({
    title,
    subtitle,
    content,
    isOpen,
    onClose,
    primaryAction,
    secondaryAction,
    isLoading = false,
}: TrialFinishSetupModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="huge"
            classNameContent={css.modalContent}
        >
            <ModalBody className={css.body}>
                <div className={css.contentContainer}>
                    <div className={css.header}>
                        <h2 className={css.title}>{title}</h2>
                        <h3 className={css.subtitle}>{subtitle}</h3>
                    </div>

                    <p>{content}</p>
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
            <ModalFooter className={css.actionsContainer}>
                <ActionButtons
                    isLoading={isLoading}
                    primaryAction={primaryAction}
                    secondaryAction={secondaryAction}
                />
            </ModalFooter>
        </Modal>
    )
}

export default TrialFinishSetupModal
