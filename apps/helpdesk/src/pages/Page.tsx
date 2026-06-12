import type { ComponentType, ReactNode } from 'react'
import { memo } from 'react'
import { isEqual } from '@gorgias/toolkit'
import { ErrorBoundary } from 'pages/ErrorBoundary'

import { AppFrame } from './AppFrame'

type Props = {
    children?: ReactNode
    // Navbar container can be changed depending on the route. See `routes.js`
    navbar?: ComponentType<any>
}

/**
 * Full-bleed page layout for routes whose content is an axiom `Panel`. The
 * Panel owns its height, scrolling and sticky header/footer, so this drops the
 * legacy card chrome (`.contentInfobar` / `.content` / `.main-content`) and
 * renders children directly into the frame.
 *
 * Works on the existing routing layer — no `AppLayout` / `PanelRoutes` needed:
 * with wayfinding off `AppFrame` draws the shell, with it on `AppLayout`'s
 * shell takes over while this stays full-bleed.
 */
const Page = ({ navbar: Navbar, children }: Props) => (
    <AppFrame navbar={Navbar} layout="panel">
        <ErrorBoundary>{children ?? null}</ErrorBoundary>
    </AppFrame>
)

const DefaultExportPage = memo(Page, isEqual)

export { DefaultExportPage }
