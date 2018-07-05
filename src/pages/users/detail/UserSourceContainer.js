import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as widgetsActions from '../../../state/widgets/actions'
import * as customersActions from '../../../state/customers/actions'

import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper'

import {getActiveCustomerId} from '../../../state/customers/selectors'
import {getSources} from '../../../state/widgets/selectors'

class UserSourceContainer extends React.Component {
    componentWillMount() {
        const {actions, params} = this.props
        actions.customers.fetchCustomer(params.userId)
    }

    render() {
        const {
            widgets,
            actions,
            activeCustomerId,
            sources,
        } = this.props

        if (!activeCustomerId) {
            return null
        }

        const identifier = activeCustomerId.toString()

        return (
            <SourceWrapper
                context="user"
                identifier={identifier}
                sources={sources}
                widgets={widgets}
                actions={actions}
            />
        )
    }
}

UserSourceContainer.propTypes = {
    params: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    sources: PropTypes.object.isRequired,
    activeCustomerId: PropTypes.number,
}

function mapStateToProps(state) {
    return {
        widgets: state.widgets,
        activeCustomerId: getActiveCustomerId(state),
        sources: getSources(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            customers: bindActionCreators(customersActions, dispatch),
            widgets: bindActionCreators(widgetsActions, dispatch)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSourceContainer)
