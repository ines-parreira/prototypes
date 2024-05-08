import React from 'react'

import LoaderComponent from 'pages/common/components/Loader/Loader'

import PageHeader from '../PageHeader/PageHeader'

import css from './Loader.less'

export default function Loader() {
    return (
        <div className={css.pageContainer}>
            <PageHeader />
            <LoaderComponent className={css.loader} />
        </div>
    )
}
