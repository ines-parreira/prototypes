import React, {ComponentType} from 'react'
import {ExpressionProps} from 'pages/common/hooks/rule/RuleProvider'
import Literal from 'pages/common/components/ast/Literal'
import Identifier from 'pages/common/components/ast/Identifier'

import UnknownSyntax from 'pages/common/components/ast/UnknownSyntax'
import LogicalExpression from 'pages/common/components/ast/expression/LogicalExpression'
import BinaryExpression from 'pages/common/components/ast/expression/BinaryExpression'
import MemberExpression from 'pages/common/components/ast/expression/MemberExpression'
import CallExpression from 'pages/common/components/ast/expression/CallExpression'
import ArrayExpression from 'pages/common/components/ast/expression/ArrayExpression'
import ObjectExpression from 'pages/common/components/ast/expression/ObjectExpression'

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
