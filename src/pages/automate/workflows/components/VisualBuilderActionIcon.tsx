import React from 'react'

import {
    colorByVisualBuilderNodeType,
    iconByVisualBuilderNodeType,
} from '../constants'
import {VisualBuilderNode} from '../models/visualBuilderGraph.types'
import css from './VisualBuilderActionIcon.less'

type Props = {
    nodeType:
        | Exclude<
              NonNullable<VisualBuilderNode['type']>,
              | 'channel_trigger'
              | 'llm_prompt_trigger'
              | 'end'
              | 'reusable_llm_prompt_trigger'
          >
        | 'custom_input'
        | 'merchant_input'
        | 'app'
}

export default function VisualBuilderActionIcon({nodeType}: Props) {
    return (
        <div
            className={css.visualBuilderActionIcon}
            style={colorByVisualBuilderNodeType[nodeType]}
        >
            {iconByVisualBuilderNodeType[nodeType]}
        </div>
    )
}
