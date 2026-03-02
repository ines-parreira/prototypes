import React, { useState } from 'react'

import { truncate } from 'lodash'

import {
    Button,
    Modal,
    OverlayContent,
    OverlayHeader,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import CopyButton from 'components/CopyButton/CopyButton'

import type { ExtendedShopifyMetafield } from './Metafield'
import { getMetafieldTitleLabel } from './utils/getMetafieldTitleLabel'

import css from './Metafield.less'

export type TextFieldMetafieldProps = {
    metafield: ExtendedShopifyMetafield
}

export function TextFieldMetafield({ metafield }: TextFieldMetafieldProps) {
    const value = String(metafield.value)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const valueLength = value.length
    // < 20 chars: Display full value
    if (valueLength < 20) {
        return (
            <div className={css.field}>
                {value}
                <span className={css.copyButton}>
                    <CopyButton value={value} />
                </span>
            </div>
        )
    }

    if (valueLength <= 120) {
        const truncatedValue = truncate(value, { length: 80 })
        return (
            <div className={css.field}>
                <Tooltip placement="top">
                    <span>{truncatedValue}</span>
                    <TooltipContent title={value} />
                </Tooltip>
                <span className={css.copyButton}>
                    <CopyButton value={value} />
                </span>
            </div>
        )
    }

    // > 120 chars: Show "Show more" button and modal
    const truncatedValue = truncate(value, { length: 80 })
    return (
        <>
            <div className={css.field}>
                {truncatedValue}
                <span className={css.copyButton}>
                    <CopyButton value={value} />
                </span>
            </div>
            <Button
                size="sm"
                variant="tertiary"
                onClick={() => setIsModalOpen(true)}
            >
                See more
            </Button>

            <Modal
                isOpen={isModalOpen}
                onOpenChange={(open) => setIsModalOpen(open)}
                size="md"
            >
                <OverlayHeader
                    title={getMetafieldTitleLabel(
                        metafield.owner_resource,
                        metafield.key,
                    )}
                />
                <OverlayContent>
                    <Text>{value}</Text>
                </OverlayContent>
            </Modal>
        </>
    )
}
