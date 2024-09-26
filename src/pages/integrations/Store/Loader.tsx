import React from 'react'

import Spinner from 'pages/common/components/Spinner/Spinner'

import css from './Loader.less'

export default function Loader({empty}: {empty?: boolean}) {
    return (
        <p className={css.spinnerWrapper}>
            <Spinner className={css.spinner} size="big" />
            Loading {empty ? '' : 'more'} Apps
        </p>
    )
}
