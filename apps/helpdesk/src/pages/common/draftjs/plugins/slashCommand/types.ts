import type {
    GuidanceVariable,
    GuidanceVariableGroup,
} from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

export type SlashCommandItem = {
    label: string
    value: string
    type: 'variable' | 'action'
    category?: string
}

export type NavigableItem =
    | { type: 'group'; group: GuidanceVariableGroup }
    | { type: 'variable'; variable: GuidanceVariable }
    | { type: 'action'; action: GuidanceAction }
