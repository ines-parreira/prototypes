import React from 'react'

import Loader from 'pages/common/components/Loader/Loader'

const NoIntegration = ({ loading = false }: { loading?: boolean }) =>
    loading ? (
        <Loader />
    ) : (
        <>You have no integration of this type at the moment.</>
    )

export default NoIntegration
