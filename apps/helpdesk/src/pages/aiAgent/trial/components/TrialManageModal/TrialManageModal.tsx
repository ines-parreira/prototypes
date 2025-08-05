import { ReactNode } from 'react'

import classNames from 'classnames'

import { Button } from '@gorgias/merchant-ui-kit'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './TrialManageModal.less'

type Action = {
    label: string
    isLoading?: boolean
    isDisabled?: boolean
    onClick: () => void
}

export type TrialManageModalProps = {
    title: string
    description: ReactNode | string
    secondaryDescription?: ReactNode | string
    advantages: string[]
    onClose: () => void
    primaryAction?: Action
    secondaryAction?: Action
}

export const TrialManageModal = ({
    title,
    description,
    advantages,
    secondaryDescription,
    primaryAction,
    secondaryAction,
    onClose,
}: TrialManageModalProps) => {
    return (
        <Modal
            isOpen
            size="large"
            onClose={onClose}
            classNameContent={css.modal}
        >
            <ModalHeader title={title} className={css.header} />
            <ModalBody className={css.body}>
                <div className={css.modalBody}>
                    <div className={css.leftSide}>
                        <div className={css.description}>{description}</div>
                    </div>
                    <div className={css.rightSide}>
                        <div
                            className={classNames(css.advantages, {
                                [css.advantagesCenter]: advantages.length === 1,
                            })}
                        >
                            {advantages.map((advantage) => (
                                <div key={advantage} className={css.advantage}>
                                    <i
                                        className={classNames(
                                            'material-icons-round',
                                            css.icon,
                                        )}
                                    >
                                        arrow_upward
                                    </i>
                                    <div className={css.advantageValue}>
                                        {advantage}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {secondaryDescription && (
                            <div className={css.secondaryDescription}>
                                {secondaryDescription}
                            </div>
                        )}
                    </div>
                </div>
            </ModalBody>
            {(primaryAction || secondaryAction) && (
                <ModalFooter className={css.footer}>
                    {secondaryAction && (
                        <Button
                            onClick={secondaryAction.onClick}
                            fillStyle="ghost"
                            intent="secondary"
                            className={
                                secondaryAction.isLoading
                                    ? undefined
                                    : css.secondaryActionButton
                            }
                            isLoading={secondaryAction.isLoading}
                            isDisabled={secondaryAction.isDisabled}
                        >
                            {secondaryAction.label}
                        </Button>
                    )}

                    {primaryAction && (
                        <Button
                            className={
                                primaryAction.isLoading
                                    ? undefined
                                    : css.primaryActionButton
                            }
                            onClick={primaryAction.onClick}
                            isLoading={primaryAction.isLoading}
                            isDisabled={primaryAction.isDisabled}
                        >
                            {primaryAction.label}
                        </Button>
                    )}
                </ModalFooter>
            )}
        </Modal>
    )
}
