import React, {ComponentType} from 'react'
import {connect} from 'react-redux'

import {RootState} from '../../../../../state/types'
import UnknownSyntax from '../UnknownSyntax'

import {StatementProps} from './statementReference'
import BlockStatement from './BlockStatement'
import ExpressionStatement from './ExpressionStatement'
import IfStatement from './IfStatement'

class Statement extends React.Component<StatementProps> {
    types: {
        [key: string]:
            | typeof IfStatement
            | typeof ExpressionStatement
            | typeof BlockStatement
    } = {
        IfStatement,
        ExpressionStatement,
        BlockStatement,
    }

    render() {
        const {schemas, depth} = this.props
        const Component = (this.types[this.props.type] ||
            UnknownSyntax) as ComponentType<StatementProps>

        return <Component {...this.props} schemas={schemas} depth={depth} />
    }
}

const mapStateToProps = (state: RootState) => ({
    schemas: state.schemas,
})

export default connect(mapStateToProps)(
    Statement
) as ComponentType<StatementProps>
