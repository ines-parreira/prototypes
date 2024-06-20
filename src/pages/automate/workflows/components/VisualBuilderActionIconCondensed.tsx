import React from 'react'

import {ActionTriggerType} from 'pages/automate/workflows/models/variables.types'
import {iconByVisualBuilderNodeType} from '../constants'
import {VisualBuilderNode} from '../models/visualBuilderGraph.types'
import css from './VisualBuilderActionIconCondensed.less'

type Props = {
    nodeType:
        | Exclude<
              NonNullable<VisualBuilderNode['type']>,
              'trigger_button' | 'end'
          >
        | ActionTriggerType
}

export default function VisualBuilderActionIconCondensed({nodeType}: Props) {
    return (
        <div className={css.visualBuilderActionIconCondensed}>
            {iconByVisualBuilderNodeType[nodeType]}
        </div>
    )
}
