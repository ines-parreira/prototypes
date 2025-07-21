import React, { ComponentType } from 'react'

import { connect } from 'react-redux'

import useAppSelector from 'hooks/useAppSelector'
import { StatementProps } from 'pages/common/hooks/rule/RuleProvider'
import { getSchemas } from 'state/schemas/selectors'

import UnknownSyntax from '../UnknownSyntax'
import BlockStatement from './BlockStatement'
import ExpressionStatement from './ExpressionStatement'
import IfStatement from './IfStatement'

const types = {
    IfStatement,
    ExpressionStatement,
    BlockStatement,
} as const
const Statement = (props: StatementProps) => {
    const { depth } = props
    const schemas = useAppSelector(getSchemas)
    const Component = (types[props.type as keyof typeof types] ||
        UnknownSyntax) as ComponentType<StatementProps>

    return <Component {...props} schemas={schemas} depth={depth} />
}

export default connect()(Statement)
