import React from 'react'

import {ActionTriggerType} from 'pages/automate/workflows/models/variables.types'
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
              'trigger_button' | 'end'
          >
        | ActionTriggerType
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
