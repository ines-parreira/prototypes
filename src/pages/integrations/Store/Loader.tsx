import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import css from './Loader.less'

export default function Loader({ empty }: { empty?: boolean }) {
    return (
        <p className={css.spinnerWrapper}>
            <LoadingSpinner className={css.spinner} size="big" />
            Loading {empty ? '' : 'more'} Apps
        </p>
    )
}
