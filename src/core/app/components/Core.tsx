import React, {ReactElement} from 'react'

import {SpotlightProvider} from 'providers/ui/SpotlightProvider'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import {SplitTicketViewProvider} from 'split-ticket-view-toggle'
import {ThemeProvider} from 'theme'

import App from './App'

type Props = {
    children: ReactElement | ReactElement[]
}

export default function Core({children}: Props) {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <SpotlightProvider>
                    <SplitTicketViewProvider>
                        <App>{children}</App>
                    </SplitTicketViewProvider>
                </SpotlightProvider>
            </ThemeProvider>
        </ErrorBoundary>
    )
}
