import React from 'react'
import {connect} from 'react-redux'

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
        const {schemas} = this.props
        const Component = this.types[this.props.type] || UnknownSyntax
        return (
            <Component
                {...this.props}
                schemas={schemas}
            />
        )
    }

}

Statement.propTypes = {
    type: React.PropTypes.string.isRequired,
    schemas: React.PropTypes.object,
}

const mapStateToProps = (state) => ({
    schemas: state.schemas,
})

export default connect(mapStateToProps)(Statement)
