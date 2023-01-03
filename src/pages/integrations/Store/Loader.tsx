import React from 'react'

import Spinner from 'pages/common/components/Spinner/Spinner'

import css from './Loader.less'

export default function Loader() {
    return (
        <p className={`${css.spinnerWrapper}`}>
            <Spinner className={css.spinner} color="gloom" />
            Loading more Apps
        </p>
    )
}
