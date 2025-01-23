import React, {ReactNode} from 'react'

import Button from 'pages/common/components/button/Button'

import css from './ThankYouModal.less'

type Props = {
    image: ReactNode
    title: string
    description: string
    actionLabel: string
    onClick: React.MouseEventHandler
    closeLabel: string
    onClose: React.MouseEventHandler
}

const ThankYouModal: React.FC<Props> = ({
    image,
    title,
    description,
    actionLabel,
    onClick,
    closeLabel,
    onClose,
}: Props) => {
    return (
        <div className={css.modal}>
            <div className={css.modalImage}>{image}</div>
            <div className={css.modalContent}>
                <h3 className={css.title}>{title}</h3>
                <p className={css.description}>{description}</p>
                <div className={css.buttonWrapper}>
                    <Button
                        className={css.buttonSpaced}
                        intent="primary"
                        fillStyle="fill"
                        onClick={onClick}
                    >
                        {actionLabel}
                    </Button>
                    <Button
                        intent="secondary"
                        fillStyle="fill"
                        onClick={onClose}
                    >
                        {closeLabel}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ThankYouModal
