import { ReactNode } from 'react'

import classNames from 'classnames'

import { Button } from '@gorgias/merchant-ui-kit'

import {
    ModalBodyWrapper,
    ModalFooterWrapper,
    ModalHeaderWrapper,
    ModalWrapper,
} from 'pages/aiAgent/trial/components/ModalWrapper'

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
    onClose?: () => void
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
        <ModalWrapper
            isOpen
            size="lg"
            toggle={onClose}
            fade
            centered
            contentClassName={css.modal}
        >
            <ModalHeaderWrapper toggle={onClose}>{title}</ModalHeaderWrapper>
            <ModalBodyWrapper>
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
            </ModalBodyWrapper>
            {(primaryAction || secondaryAction) && (
                <ModalFooterWrapper>
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
                </ModalFooterWrapper>
            )}
        </ModalWrapper>
    )
}
