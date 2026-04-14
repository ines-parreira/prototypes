import { Dot, Tag, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { IntentItem } from './hooks/useLinkedIntentsSidebarSkill'

import css from './SkillEditorSidePanelIntentsSection.less'

type Props = IntentItem & {
    onClose?: () => void
}

export const SkillIntentTag = ({
    label,
    color,
    showLeadingDot,
    tooltip,
    onClose,
}: Props) => {
    const tag = (
        <Tag
            color={color}
            leadingSlot={
                showLeadingDot ? <Dot color="orange" size="sm" /> : undefined
            }
            onClose={onClose}
        >
            {label}
        </Tag>
    )

    if (!tooltip) return tag

    return (
        <Tooltip trigger={<span className={css.intentTagWrapper}>{tag}</span>}>
            <TooltipContent title={tooltip} />
        </Tooltip>
    )
}
