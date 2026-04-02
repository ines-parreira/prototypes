import { Text } from '@gorgias/axiom'

import css from './SkillEditorSidePanel.less'

export const SkillEditorSidePanelPerformanceTab = () => {
    return (
        <div className={css.performanceTab}>
            <Text size="sm" color="content-neutral-secondary">
                Performance metrics coming soon.
            </Text>
        </div>
    )
}
