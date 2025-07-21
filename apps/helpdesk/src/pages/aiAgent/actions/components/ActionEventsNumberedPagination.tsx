import { NumberedPagination } from 'pages/common/components/Paginations'

import css from './ActionEventsNumberedPagination.less'

interface Props {
    page?: number
    count?: number
    onChange: (page: number) => void
}

export default function ActionEventsNumberedPagination({
    page,
    count,
    onChange,
}: Props) {
    return (
        <div className={css.container}>
            {typeof count === 'number' && count > 1 && (
                <NumberedPagination
                    className={css.pagination}
                    page={page}
                    count={count}
                    onChange={onChange}
                    size="medium"
                />
            )}
        </div>
    )
}
