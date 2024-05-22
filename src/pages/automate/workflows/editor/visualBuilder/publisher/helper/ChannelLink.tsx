import React from 'react'
import {Link, useParams} from 'react-router-dom'

const ChannelsLink = ({linkText}: {linkText: string}) => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    return (
        <Link
            to={{
                pathname: `/app/automation/${shopType}/${shopName}/connected-channels`,
                state: {
                    from: 'workflow-editor',
                },
            }}
        >
            {linkText}
        </Link>
    )
}
export default ChannelsLink
