import type { ComponentProps } from 'react'

import { NavLink } from 'react-router-dom'

import { DisplayType } from 'components/Navigation/components/NavigationSectionItem'
import { Navigation } from 'components/Navigation/Navigation'
import { ProtectedRoute } from 'domains/reporting/pages/report-chart-restrictions/ProtectedRoute'

type StatsNavSectionItemProps = Omit<ComponentProps<typeof NavLink>, 'to'> & {
    to: string
    displayType?: (typeof DisplayType)[keyof typeof DisplayType]
}

export function StatsNavSectionItem({
    to,
    children,
    displayType = DisplayType.Indent,
    ...props
}: StatsNavSectionItemProps) {
    return (
        <ProtectedRoute path={to}>
            <Navigation.SectionItem
                as={NavLink}
                to={to}
                displayType={displayType}
                {...props}
            >
                {children}
            </Navigation.SectionItem>
        </ProtectedRoute>
    )
}
