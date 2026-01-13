import type { ReactNode } from 'react'
import type React from 'react'

import classNames from 'classnames'
import Skeleton from 'react-loading-skeleton'

import { Box, Button, Modal } from '@gorgias/axiom'

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
        <Modal isOpen={isOpen} onOpenChange={onClose} aria-label={title}>
            <Box flexDirection="column" className={css.modal}>
                <div className={css.modalImage}>{image}</div>
                <Box flexDirection="column" className={css.modalBody}>
                    {isLoading ? (
                        <div
                            className={css.loadingContainer}
                            data-testid="skeleton-loader"
                        >
                            <Skeleton width={'30%'} height={24} />
                            <Skeleton width={'100%'} height={24} />
                            <Button variant="secondary" isLoading>
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
                                        variant="primary"
                                        onClick={onClick}
                                        isLoading={isActionLoading}
                                    >
                                        {actionLabel}
                                    </Button>
                                )}
                                {closeLabel && (
                                    <Button
                                        variant="secondary"
                                        onClick={onClose}
                                        isDisabled={isActionLoading}
                                    >
                                        {closeLabel}
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </Box>
            </Box>
        </Modal>
    )
}

export default ThankYouModal
