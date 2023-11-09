import React, {ComponentType} from 'react'

import Literal from '../Literal'
import Identifier from '../Identifier'
import UnknownSyntax from '../UnknownSyntax'

import {ExpressionProps} from './expressionReference'
import LogicalExpression from './LogicalExpression'
import BinaryExpression from './BinaryExpression'
import MemberExpression from './MemberExpression'
import CallExpression from './CallExpression'
import ArrayExpression from './ArrayExpression'
import ObjectExpression from './ObjectExpression'

export default class Expression extends React.Component<ExpressionProps> {
    types: {
        [key: string]:
            | typeof BinaryExpression
            | typeof LogicalExpression
            | typeof Literal
            | typeof MemberExpression
            | typeof Identifier
            | typeof CallExpression
            | typeof ObjectExpression
            | typeof ArrayExpression
    } = {
        BinaryExpression,
        LogicalExpression,
        Literal,
        Identifier,
        MemberExpression,
        CallExpression,
        ObjectExpression,
        ArrayExpression,
    }

    render() {
        const Component = (this.types[this.props.type] ||
            UnknownSyntax) as ComponentType<ExpressionProps>

        return <Component {...this.props} />
    }
}
