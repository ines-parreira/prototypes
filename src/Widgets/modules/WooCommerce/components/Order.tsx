import React, {ReactNode} from 'react'
import {Map} from 'immutable'

import {CardHeaderTitle} from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderTitle'
import {CardCustomization} from 'Widgets/modules/Template/modules/Card'

import {useStore} from '../hooks/useStore'

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
