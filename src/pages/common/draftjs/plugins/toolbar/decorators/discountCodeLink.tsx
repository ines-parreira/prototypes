import React from 'react'
import {ContentBlock, ContentState} from 'draft-js'

import {
    DecoratorStrategyCallback,
    DecoratorComponentProps,
    Decorator,
} from '../../types'
import {draftjsGorgiasCustomBlockRenderers} from '../index'

const discountCodeLink = (): Decorator => ({
    strategy: (
        contentBlock: ContentBlock,
        callback: DecoratorStrategyCallback,
        contentState: ContentState
    ) => {
        contentBlock.findEntityRanges((character) => {
            const entityKey = character.getEntity()
            return (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() ===
                    draftjsGorgiasCustomBlockRenderers.DiscountCodeLink
            )
        }, callback)
    },

    component: (props: DecoratorComponentProps) => {
        const {contentState, entityKey, children} = props
        const {url, code} = contentState.getEntity(entityKey).getData()
        return (
            <a
                id={entityKey}
                href={url}
                data-discount-code={code}
                target="_blank"
                rel="noreferrer"
            >
                {children}
            </a>
        )
    },
})

export default discountCodeLink
