import React, {ComponentType} from 'react'
import {List, Map} from 'immutable'

import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'
import Literal from '../Literal'
import Identifier from '../Identifier'
import UnknownSyntax from '../UnknownSyntax'

import LogicalExpression from './LogicalExpression'
import BinaryExpression from './BinaryExpression'
import MemberExpression from './MemberExpression'
import CallExpression from './CallExpression'
import ArrayExpression from './ArrayExpression'
import ObjectExpression from './ObjectExpression'

type Props = {
    actions: RuleItemActions
    className?: string
    parent: List<any>
    rule: Map<any, any>
    schemas: Map<any, any>
    leftsiblings: Maybe<List<any>>
    type: string
    depth: number
}

export default class Expression extends React.Component<Props> {
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
            UnknownSyntax) as ComponentType<Props>

        return <Component {...this.props} />
    }
}
