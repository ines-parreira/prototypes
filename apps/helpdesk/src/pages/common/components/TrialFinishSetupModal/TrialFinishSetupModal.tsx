import classNames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'

import css from './TrialFinishSetupModal.less'

export type TrialFinishSetupFeature = {
    icon: string
    title: string
    description: string
    isCompleted?: boolean
    benefit?: string
}

export type TrialFinishSetupModalProps = {
    title: React.ReactNode
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
    features: TrialFinishSetupFeature[]
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
    isCompleted,
}: {
    icon: string
    title: string
    description: string
    benefit?: string
    isLast: boolean
    isCompleted: boolean
}) => (
    <div
        className={classNames(css.featureCard, {
            [css.featureCompleted]: isCompleted,
        })}
    >
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
    features,
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
                    {features.map((item, index) => (
                        <FeatureCard
                            key={index}
                            {...item}
                            isLast={index === features.length - 1}
                            isCompleted={!!item.isCompleted}
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
