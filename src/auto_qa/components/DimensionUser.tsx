import React from 'react'

import { useGetUser } from '@gorgias/api-queries'

import Avatar from 'pages/common/components/Avatar/Avatar'

type Props = {
    userId: number
}

export default function DimensionUser({ userId }: Props) {
    const { data, isError, isLoading } = useGetUser<{ data: { name: string } }>(
        userId,
    )

    if (isLoading) return <>Loading...</>

    if (isError || !data) return <>Failed to load</>

    return (
        <>
            <Avatar name={data.data.name} shape="round" size={16} />
            Edited by {isLoading ? '...' : data.data.name}
        </>
    )
}
