import { AutoQAAgentPerformanceHeatmapSwitch } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentPerformanceHeatmapSwitch'
import css from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsCardExtra.less'

export const AutoQAAgentsCardExtra = () => {
    return (
        <div className={css.wrapper}>
            <AutoQAAgentPerformanceHeatmapSwitch />
        </div>
    )
}
