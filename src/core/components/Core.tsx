import React, {ReactElement} from 'react'

import {ErrorBoundary} from 'pages/ErrorBoundary'

type Props = {
    children: ReactElement | ReactElement[]
}

export default function Core({children}: Props) {
    return <ErrorBoundary>{children}</ErrorBoundary>
}
