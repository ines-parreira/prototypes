import {List, Map} from 'immutable'
import React, {ComponentType} from 'react'
import {connect} from 'react-redux'

import {RuleItemActions} from '../../../../settings/rules/detail/components/RuleItem/RuleItem'
import {RootState} from '../../../../../state/types'
import UnknownSyntax from '../UnknownSyntax'

import BlockStatement from './BlockStatement'
import ExpressionStatement from './ExpressionStatement'
import IfStatement from './IfStatement'

type Props = {
    parent: List<any>
    type: string
    schemas: Map<any, any>
    depth: number
    rule: Map<any, any>
    actions: RuleItemActions
}

class Statement extends React.Component<Props> {
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
            UnknownSyntax) as ComponentType<Props>

        return <Component {...this.props} schemas={schemas} depth={depth} />
    }
}

const mapStateToProps = (state: RootState) => ({
    schemas: state.schemas,
})

export default connect(mapStateToProps)(Statement) as ComponentType<Props>
