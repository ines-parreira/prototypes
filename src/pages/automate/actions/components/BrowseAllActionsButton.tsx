import React from 'react'

import {Link, useParams} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'

export default function CreateCustomActionButton() {
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()
    return (
        <Link to={`/app/automation/${shopType}/${shopName}/actions/templates`}>
            <Button>Browse all actions</Button>
        </Link>
    )
}
