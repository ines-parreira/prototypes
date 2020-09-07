import React from 'react'
import PropTypes from 'prop-types'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

import * as widgetsActions from '../../../state/widgets/actions.ts'
import * as customersActions from '../../../state/customers/actions.ts'

import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper'

import {getActiveCustomerId} from '../../../state/customers/selectors.ts'
import {getSources} from '../../../state/widgets/selectors.ts'

class CustomerSourceContainer extends React.Component {
    componentWillMount() {
        const {actions, params} = this.props
        actions.customers.fetchCustomer(params.customerId)
    }

    render() {
        const {widgets, actions, activeCustomerId, sources} = this.props

        if (!activeCustomerId) {
            return null
        }

        const identifier = activeCustomerId.toString()

        return (
            <SourceWrapper
                context="customer"
                identifier={identifier}
                sources={sources}
                widgets={widgets}
                actions={actions}
            />
        )
    }
}

CustomerSourceContainer.propTypes = {
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
            widgets: bindActionCreators(widgetsActions, dispatch),
        },
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomerSourceContainer)
