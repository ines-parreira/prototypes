import React, {ReactNode} from 'react'
import {Map} from 'immutable'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {useStore} from './useStore'

export default function Order() {
    return {
        TitleWrapper,
    }
}

export function TitleWrapper({
    source,
    children,
}: {
    source: Map<any, any>
    children: ReactNode
}) {
    const externalId: string = source.get('external_id')
    const store = useStore() as Map<any, any>
    if (!store) {
        return null
    }
    const storeUrl: string = store.get('url')
    const url = `${storeUrl}/wp-admin/post.php?post=${externalId}&action=edit`
    return (
        <>
            <CardHeaderTitle>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    {`#${externalId}` || children}
                </a>
            </CardHeaderTitle>
        </>
    )
}
