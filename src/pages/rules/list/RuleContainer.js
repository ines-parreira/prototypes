import {connect} from 'react-redux'

import {bindActionCreators} from 'redux'

import RulesView from './components/RulesView'

import * as RuleActions from '../../../state/rules/actions'
import * as SchemaActions from '../../../state/schema/actions'

const mapStateToProps = (state) => ({
    rules: state.rules,
    schemas: state.schemas,
})

const mapDispatchToProps = (dispatch) => ({
    actions: {
        rules: bindActionCreators(RuleActions, dispatch),
        schemas: bindActionCreators(SchemaActions, dispatch),
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(RulesView)
