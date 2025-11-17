import type { ReactNode } from 'react'
import type React from 'react'

import classNames from 'classnames'
import Skeleton from 'react-loading-skeleton'

import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './ThankYouModal.less'

type Props = {
    isOpen: boolean
    image: ReactNode
    title: string
    description: string
    actionLabel?: string
    onClick?: React.MouseEventHandler
    closeLabel?: string
    onClose?: () => void
    isLoading?: boolean
    isActionLoading?: boolean
}

const ThankYouModal: React.FC<Props> = ({
    isOpen,
    image,
    title,
    description,
    actionLabel,
    closeLabel,
    onClick = () => {},
    onClose = () => {},
    isLoading,
    isActionLoading,
}: Props) => {
    return (
        <Modal classNameDialog={css.modal} isOpen={isOpen} onClose={onClose}>
            <div className={css.modalImage}>{image}</div>
            <ModalBody className={css.modalBody}>
                {isLoading ? (
                    <div
                        className={css.loadingContainer}
                        data-testid="skeleton-loader"
                    >
                        <Skeleton width={'30%'} height={24} />
                        <Skeleton width={'100%'} height={24} />
                        <Button intent="secondary" fillStyle="fill" isLoading>
                            <></>
                        </Button>
                    </div>
                ) : (
                    <>
                        <h3
                            className={classNames(
                                'heading-page-semibold',
                                css.text,
                            )}
                        >
                            {title}
                        </h3>
                        <p className={css.text}>{description}</p>
                        <div className={css.buttonWrapper}>
                            {actionLabel && (
                                <Button
                                    className={css.buttonSpaced}
                                    intent="primary"
                                    fillStyle="fill"
                                    onClick={onClick}
                                    isLoading={isActionLoading}
                                >
                                    {actionLabel}
                                </Button>
                            )}
                            {closeLabel && (
                                <Button
                                    intent="secondary"
                                    fillStyle="fill"
                                    onClick={onClose}
                                    isDisabled={isActionLoading}
                                >
                                    {closeLabel}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </ModalBody>
        </Modal>
    )
}

export default ThankYouModal
