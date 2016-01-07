import React, {PropTypes} from 'react'

import IfStatement from './IfStatement'
import ExpressionStatement from './ExpressionStatement'
import BlockStatement from './BlockStatement'
import UnknownSyntax from '../UnknownSyntax.js'

export default class Statement extends React.Component {
    render() {
        const {type} = this.props

        switch (type) {
            case 'IfStatement':
                return (
                    <IfStatement {...this.props} />
                )
            case 'ExpressionStatement':
                return (
                    <ExpressionStatement {...this.props} />
                )
            case 'BlockStatement':
                return (
                    <BlockStatement { ...this.props } />
                )
            case undefined:
                return (
                    <span></span>
                )

            default:
                return <UnknownSyntax { ...this.props } />
        }
    }
}

Statement.propTypes = {
    type: PropTypes.string
}

