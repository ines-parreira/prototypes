// @flow
import React from 'react'

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
    type: string
}

export default class Expression extends React.Component<Props> {

    types = {
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
        const Component = this.types[this.props.type] || UnknownSyntax
        return <Component {...this.props} />
    }

}
