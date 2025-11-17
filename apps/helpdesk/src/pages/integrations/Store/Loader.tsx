import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import css from './Loader.less'

export default function Loader({ empty }: { empty?: boolean }) {
    return (
        <p className={css.spinnerWrapper}>
            <LoadingSpinner className={css.spinner} size="big" />
            Loading {empty ? '' : 'more'} Apps
        </p>
    )
}
