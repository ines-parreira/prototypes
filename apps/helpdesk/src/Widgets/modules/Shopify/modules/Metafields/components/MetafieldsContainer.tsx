import type { ReactNode } from 'react'
import React, { useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classnames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import orderIcon from 'assets/img/icons/order-icon.svg'

import css from './MetafieldsContainer.less'

type Props = {
    children: ReactNode
    title: string
    onOpened?: () => void
}

export default function MetafieldsContainer({
    children,
    title,
    onOpened,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const headerRef = useRef<HTMLDivElement>(null)
    const enableShopifyMetafieldIngestion = useFlag(
        FeatureFlagKey.EnableShopifyMetafieldsIngestionUI,
        false,
    )
    const onClick = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            onOpened?.()
        }
    }
    return (
        <div className={css.container}>
            <div className={css.header} ref={headerRef}>
                <img alt={'Metafields'} src={orderIcon} className={css.icon} />
                <span className={css.title}>{title}</span>
                <span
                    className={classnames(css.dropdownIcon, 'clickable')}
                    onClick={onClick}
                    title={isOpen ? 'Fold this card' : 'Unfold this card'}
                >
                    {isOpen ? (
                        <i className={`material-icons ${css.toggle}`}>
                            expand_less
                        </i>
                    ) : (
                        <i className={`material-icons ${css.toggle}`}>
                            expand_more
                        </i>
                    )}
                </span>
            </div>
            {enableShopifyMetafieldIngestion && (
                <Tooltip placement="top-end" target={headerRef}>
                    Shopify metafields apply only to new or updated customers
                    and orders. Anything created before the import won&apos;t be
                    updated retroactively.
                </Tooltip>
            )}
            <div className={css.content}>{isOpen && children}</div>
        </div>
    )
}
