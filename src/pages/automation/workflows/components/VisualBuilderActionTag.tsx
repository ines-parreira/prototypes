import React, {PropsWithChildren} from 'react'
import classnames from 'classnames'

import {
    colorByVisualBuilderNodeType,
    iconByVisualBuilderNodeType,
} from '../constants'
import {VisualBuilderNode} from '../models/visualBuilderGraph.types'

import css from './VisualBuilderActionTag.less'

type VisualBuilderActionTagProps = {
    nodeType: Exclude<
        NonNullable<VisualBuilderNode['type']>,
        'trigger_button' | 'end'
    >
}

export default function VisualBuilderActionTag({
    nodeType,
    children,
}: PropsWithChildren<VisualBuilderActionTagProps>) {
    return (
        <div
            className={classnames(css.visualBuilderActionTag)}
            style={colorByVisualBuilderNodeType[nodeType]}
        >
            {iconByVisualBuilderNodeType[nodeType]}
            {children}
        </div>
    )
}
