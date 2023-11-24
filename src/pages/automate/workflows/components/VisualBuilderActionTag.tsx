import React from 'react'
import classnames from 'classnames'

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
        'trigger_button' | 'end'
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
