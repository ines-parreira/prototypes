import React from 'react'

import LogicalExpression from './LogicalExpression'
import BinaryExpression from './BinaryExpression'
import Literal from '../Literal'
import Identifier from '../Identifier'
import MemberExpression from './MemberExpression'
import CallExpression from './CallExpression'
import ArrayExpression from './ArrayExpression'
import ObjectExpression from './ObjectExpression'
import UnknownSyntax from '../UnknownSyntax'

class Expression extends React.Component {

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

Expression.propTypes = {
    type: React.PropTypes.string.isRequired,
}

export default Expression
