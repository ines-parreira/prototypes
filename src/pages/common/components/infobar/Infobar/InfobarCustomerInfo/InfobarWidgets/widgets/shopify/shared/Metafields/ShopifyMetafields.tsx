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
                return (
                    <StaticField
                        key={index}
                        label={`${field['namespace'] as string}.${
                            field['key'] as string
                        }`}
                    >
                        {field['value']}
                    </StaticField>
                )
            })}
        </>
    )
}
