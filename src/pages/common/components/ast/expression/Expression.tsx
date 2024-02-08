import React, {ComponentType} from 'react'
import {ExpressionProps} from 'pages/common/hooks/rule/RuleProvider'
import Literal from '../Literal'
import Identifier from '../Identifier'

import UnknownSyntax from '../UnknownSyntax'
import LogicalExpression from './LogicalExpression'
import BinaryExpression from './BinaryExpression'
import MemberExpression from './MemberExpression'
import CallExpression from './CallExpression'
import ArrayExpression from './ArrayExpression'
import ObjectExpression from './ObjectExpression'

const types = {
    BinaryExpression,
    LogicalExpression,
    Literal,
    Identifier,
    MemberExpression,
    CallExpression,
    ObjectExpression,
    ArrayExpression,
} as const

export default function Expression(props: ExpressionProps) {
    const Component = (types[props.type as keyof typeof types] ||
        UnknownSyntax) as ComponentType<ExpressionProps>

    return <Component {...props} />
}
