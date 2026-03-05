import { history } from '@repo/routing'

import { ButtonGroup, ButtonGroupItem } from '@gorgias/axiom'

import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import type { StatsNavbarSection } from 'routes/layout/products/analytics'

type Props = {
    sections: StatsNavbarSection[]
}

export const CollapsedAnalyticsSidebar = ({ sections }: Props) => {
    const handleSelectionChange = (id: string) => {
        const sectionOverviewRoute = sections.find(
            (section) => section.id === id,
        )?.items?.[0]?.route

        if (!sectionOverviewRoute) return

        history.push(`${STATS_ROUTE_PREFIX}${sectionOverviewRoute}`)
    }

    return (
        <ButtonGroup
            orientation="vertical"
            withoutBorder
            onSelectionChange={handleSelectionChange}
        >
            {sections.map((section) => (
                <ButtonGroupItem
                    key={section.id}
                    id={section.id}
                    icon={section.icon}
                >
                    {section.label}
                </ButtonGroupItem>
            ))}
        </ButtonGroup>
    )
}
