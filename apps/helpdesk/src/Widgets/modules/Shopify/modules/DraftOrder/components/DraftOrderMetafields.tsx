import { logEvent, SegmentEvent } from '@repo/logging'

import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

import {
    Metafield,
    MetafieldsContainer,
} from 'Widgets/modules/Shopify/modules/Metafields'

import css from './DraftOrderMetafields.less'

type Props = {
    metafields?: ShopifyMetafield[]
}

export default function WrappedDraftOrderMetafields({ metafields }: Props) {
    const onOpened = () => {
        logEvent(SegmentEvent.ShopifyMetafieldsOpenDraftOrder)
    }

    return (
        <MetafieldsContainer
            onOpened={onOpened}
            title="Draft Order Metafields"
            defaultOpen
        >
            <DraftOrderMetafields metafields={metafields} />
        </MetafieldsContainer>
    )
}

export function DraftOrderMetafields({ metafields }: Props) {
    if (!metafields?.length) {
        return (
            <span className={css.infoMessage}>
                Draft order has no metafields populated.
            </span>
        )
    }

    return (
        <>
            {metafields.map((field, index) => (
                <Metafield key={index} metafield={field} />
            ))}
        </>
    )
}
