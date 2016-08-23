import React, {PropTypes} from 'react'

import LogicalExpression from './LogicalExpression'
import BinaryExpression from './BinaryExpression'
import Literal from '../Literal'
import Identifier from '../Identifier'
import MemberExpression from './MemberExpression'
import CallExpression from './CallExpression'
import ObjectExpression from './ObjectExpression'
import UnknownSyntax from '../UnknownSyntax'

export default class Expression extends React.Component {
    render() {
        const {type} = this.props
        switch (type) {
            case 'BinaryExpression':
                return (
                    <BinaryExpression {...this.props} />
                )

            case 'LogicalExpression':
                return (
                    <LogicalExpression {...this.props} />
                )

            case 'Literal':
                return (
                    <Literal {...this.props} />
                )

            case 'Identifier':
                return (
                    <Identifier {...this.props} />
                )

            case 'MemberExpression':
                return (
                    <MemberExpression {...this.props} />
                )

            case 'CallExpression':
                return (
                    <CallExpression {...this.props} />
                )

            case 'ObjectExpression':
                return (
                    <ObjectExpression {...this.props} />
                )
            default:
                return <UnknownSyntax {... this.props} />
        }
    }
}

Expression.propTypes = {
    type: PropTypes.string
}

