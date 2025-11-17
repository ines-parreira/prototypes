import type { ReactNode } from 'react'
import React from 'react'

import type { Map } from 'immutable'

import type { CardCustomization } from 'Widgets/modules/Template/modules/Card'
import { CardHeaderTitle } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderTitle'

import { useStore } from '../hooks/useStore'

export const orderCustomization: CardCustomization = {
    TitleWrapper,
}

export function TitleWrapper({
    source,
    children,
}: {
    source: Map<any, any>
    children: ReactNode
}) {
    const externalId: string = source.get('external_id')
    const store = useStore()
    if (!store) {
        return null
    }
    const storeUrl = store.url
    const url = `${storeUrl}/wp-admin/post.php?post=${externalId}&action=edit`
    return (
        <>
            {externalId ? (
                <CardHeaderTitle>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        {`#${externalId}`}
                    </a>
                </CardHeaderTitle>
            ) : (
                <CardHeaderTitle>{children}</CardHeaderTitle>
            )}
        </>
    )
}
