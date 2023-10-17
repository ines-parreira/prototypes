import React, {ReactElement} from 'react'

import {ErrorBoundary} from 'pages/ErrorBoundary'
import {ThemeProvider} from 'theme'

import App from './App'

type Props = {
    children: ReactElement | ReactElement[]
}

export default function Core({children}: Props) {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <App>{children}</App>
            </ThemeProvider>
        </ErrorBoundary>
    )
}
