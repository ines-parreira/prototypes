import React from 'react'

import BlockStatement from './BlockStatement'
import ExpressionStatement from './ExpressionStatement'
import IfStatement from './IfStatement'
import UnknownSyntax from '../UnknownSyntax'

class Statement extends React.Component {

    types = {
        IfStatement,
        ExpressionStatement,
        BlockStatement,
    }

    render() {
        const Component = this.types[this.props.type] || UnknownSyntax
        return <Component {...this.props} />
    }

}

Statement.propTypes = {
    type: React.PropTypes.string.isRequired,
}

export default Statement
