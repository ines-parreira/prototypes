// @flow
import React from 'react'
import {connect} from 'react-redux'

import UnknownSyntax from '../UnknownSyntax'

import BlockStatement from './BlockStatement'
import ExpressionStatement from './ExpressionStatement'
import IfStatement from './IfStatement'

type Props = {
    type: string,
    schemas: ?Object,
    depth: number,
}

class Statement extends React.Component<Props> {
    types = {
        IfStatement,
        ExpressionStatement,
        BlockStatement,
    }

    render() {
        const {schemas, depth} = this.props
        const Component = this.types[this.props.type] || UnknownSyntax
        return <Component {...this.props} schemas={schemas} depth={depth} />
    }
}

const mapStateToProps = (state) => ({
    schemas: state.schemas,
})

export default connect(mapStateToProps)(Statement)
