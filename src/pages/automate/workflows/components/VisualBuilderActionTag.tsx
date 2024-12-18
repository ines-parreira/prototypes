import classnames from 'classnames'
import React from 'react'

import {
    colorByVisualBuilderNodeType,
    iconByVisualBuilderNodeType,
    labelByVisualBuilderNodeType,
} from '../constants'
import {VisualBuilderNode} from '../models/visualBuilderGraph.types'

import css from './VisualBuilderActionTag.less'

type Props = {
    nodeType: Exclude<
        NonNullable<VisualBuilderNode['type']>,
        | 'channel_trigger'
        | 'end'
        | 'reusable_llm_prompt_trigger'
        | 'reusable_llm_prompt_call'
    >
}

export default function VisualBuilderActionTag({nodeType}: Props) {
    return (
        <div
            className={classnames(css.visualBuilderActionTag)}
            style={colorByVisualBuilderNodeType[nodeType]}
        >
            {iconByVisualBuilderNodeType[nodeType]}
            {labelByVisualBuilderNodeType[nodeType]}
        </div>
    )
}
