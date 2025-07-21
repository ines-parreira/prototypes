import { iconByVisualBuilderNodeType } from '../constants'
import { VisualBuilderNode } from '../models/visualBuilderGraph.types'

import css from './VisualBuilderActionIconCondensed.less'

type Props = {
    nodeType: Exclude<
        NonNullable<VisualBuilderNode['type']>,
        | 'channel_trigger'
        | 'llm_prompt_trigger'
        | 'end'
        | 'reusable_llm_prompt_trigger'
        | 'reusable_llm_prompt_call'
    >
}

export default function VisualBuilderActionIconCondensed({ nodeType }: Props) {
    return (
        <div className={css.visualBuilderActionIconCondensed}>
            {iconByVisualBuilderNodeType[nodeType]}
        </div>
    )
}
