import { ComponentProps } from 'react'

import { NavLink } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import { ProtectedRoute } from 'pages/stats/report-chart-restrictions/ProtectedRoute'

type StatsNavSectionItemProps = Omit<ComponentProps<typeof NavLink>, 'to'> & {
    to: string
}

export function StatsNavSectionItem({
    to,
    children,
    ...props
}: StatsNavSectionItemProps) {
    return (
        <ProtectedRoute path={to}>
            <Navigation.SectionItem
                as={NavLink}
                to={to}
                displayType="indent"
                {...props}
            >
                {children}
            </Navigation.SectionItem>
        </ProtectedRoute>
    )
}
