import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'

import { AnalyticsOverviewReportConfig } from '../../AnalyticsOverviewReportConfig'
import type {
    DashboardLayoutConfig,
    LayoutSection,
} from '../../types/layoutConfig'
import { validateLayoutConfig } from '../../utils/validateLayoutConfig'

import css from './DashboardLayoutRenderer.less'

type DashboardLayoutRendererProps = {
    layoutConfig: DashboardLayoutConfig
}

const renderSection = (section: LayoutSection) => {
    const sectionClassName = section.type === 'table' ? undefined : css.section

    return (
        <DashboardSection key={section.id} className={sectionClassName}>
            {section.items.map((item) => (
                <DashboardGridCell key={item.chartId} size={item.gridSize}>
                    <DashboardComponent
                        chart={item.chartId}
                        config={AnalyticsOverviewReportConfig}
                    />
                </DashboardGridCell>
            ))}
        </DashboardSection>
    )
}

export const DashboardLayoutRenderer = ({
    layoutConfig,
}: DashboardLayoutRendererProps) => {
    const validatedConfig = validateLayoutConfig(layoutConfig)

    return <>{validatedConfig.sections.map(renderSection)}</>
}
