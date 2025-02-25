import React from 'react'

import { NumberedPagination } from 'pages/common/components/Paginations'

import css from './RecommendationPagination.less'

interface Props {
    page?: number
    count?: number
    onChange: (page: number) => void
}

export default function RecommendationPagination({
    page,
    count,
    onChange,
}: Props) {
    return (
        <div className={css.container}>
            {typeof count === 'number' && count > 1 && (
                <NumberedPagination
                    page={page}
                    count={count}
                    onChange={onChange}
                    size="medium"
                />
            )}
        </div>
    )
}
