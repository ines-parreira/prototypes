import type { ReactNode } from 'react'

import { Box } from '@gorgias/axiom'

import { ErrorBoundary } from 'pages/ErrorBoundary'

import css from './InfobarLayout.less'

type InfobarLayoutProps = {
    children: ReactNode
}

/**
 * Main container for the infobar panel.
 */
export function InfobarLayoutContainer({ children }: InfobarLayoutProps) {
    return (
        <Box
            flex={1}
            flexDirection="column"
            height="100%"
            className={css.container}
        >
            {children}
        </Box>
    )
}

/**
 * Scrollable content area for the infobar.
 */
export function InfobarLayoutContent({ children }: InfobarLayoutProps) {
    return (
        <ErrorBoundary>
            <Box
                flex={1}
                flexDirection="column"
                height="100%"
                className={css.content}
            >
                {children}
            </Box>
        </ErrorBoundary>
    )
}
