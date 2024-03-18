import {ShopifyMetafield} from '@gorgias/api-queries'
import React from 'react'
import StaticField from 'Infobar/features/Field/display/StaticField'

type Props = {
    metafields: ShopifyMetafield[]
}

export default function ShopifyMetafields({metafields}: Props) {
    return (
        <>
            {metafields.map((field, index) => {
                const namespace = field.namespace || ''
                const key = field.key || ''
                const value = field.value || ''

                return (
                    <StaticField key={index} label={`${namespace}.${key}`}>
                        {value}
                    </StaticField>
                )
            })}
        </>
    )
}
