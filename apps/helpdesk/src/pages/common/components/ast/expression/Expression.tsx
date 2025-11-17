import type { ComponentType } from 'react'

import ArrayExpression from 'pages/common/components/ast/expression/ArrayExpression'
import BinaryExpression from 'pages/common/components/ast/expression/BinaryExpression'
import CallExpression from 'pages/common/components/ast/expression/CallExpression'
import LogicalExpression from 'pages/common/components/ast/expression/LogicalExpression'
import MemberExpression from 'pages/common/components/ast/expression/MemberExpression'
import ObjectExpression from 'pages/common/components/ast/expression/ObjectExpression'
import Identifier from 'pages/common/components/ast/Identifier'
import Literal from 'pages/common/components/ast/Literal'
import UnknownSyntax from 'pages/common/components/ast/UnknownSyntax'
import type { ExpressionProps } from 'pages/common/hooks/rule/RuleProvider'

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
    // TODO(React18): Find a solution to casting to unknown once we upgrade to React 18 types
    const Component = (types[props.type as keyof typeof types] ||
        UnknownSyntax) as unknown as ComponentType<ExpressionProps>

    return <Component {...props} />
}
