import React, {ReactNode, useState} from 'react'
import classnames from 'classnames'
import orderIcon from 'assets/img/icons/order-icon.svg'
import {logEvent, SegmentEvent} from 'common/segment'
import css from './MetafieldsContainer.less'

type Props = {
    children: ReactNode
}

export default function MetafieldsContainer({children}: Props) {
    const [isOpen, setIsOpen] = useState(false)

    const onClick = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            logEvent(SegmentEvent.ShopifyMetafieldsOpen)
        }
    }
    return (
        <div className={css.container}>
            <div className={css.header}>
                <img alt={'Metafields'} src={orderIcon} className={css.icon} />
                <span className={css.title}>Metafields</span>
                <span
                    className={classnames(css.dropdownIcon, 'clickable')}
                    onClick={onClick}
                    title={isOpen ? 'Fold this card' : 'Unfold this card'}
                >
                    {isOpen ? (
                        <i className="material-icons">expand_less</i>
                    ) : (
                        <i className="material-icons">expand_more</i>
                    )}
                </span>
            </div>
            <div className={css.content}>{isOpen && children}</div>
        </div>
    )
}
