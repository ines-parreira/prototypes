import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import Infobar from '../../common/components/infobar/Infobar'

import * as WidgetActions from '../../../state/widgets/actions'
import * as InfobarActions from '../../../state/infobar/actions'

import {getActiveCustomer, getActiveCustomerId} from '../../../state/customers/selectors'
import {getSources} from '../../../state/widgets/selectors'

class CustomerInfobarContainer extends React.Component {
    componentWillMount() {
        const {actions} = this.props

        actions.widgets.selectContext('customer')
        actions.widgets.fetchWidgets()
    }

    render() {
        const {
            actions,
            widgets,
            route,
            infobar,
            activeCustomer,
            sources,
            activeCustomerId,
        } = this.props

        if (!activeCustomerId) {
            return null
        }

        const identifier = activeCustomerId.toString()

        return (
            <Infobar
                actions={actions}
                infobar={infobar}
                sources={sources}
                isRouteEditingWidgets={!!route.isEditingWidgets}
                identifier={identifier}
                customer={activeCustomer}
                widgets={widgets}
                context="customer"
            />
        )
    }
}

CustomerInfobarContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    infobar: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    activeCustomer: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    sources: PropTypes.object.isRequired,
    activeCustomerId: PropTypes.number,
}

function mapStateToProps(state) {
    return {
        infobar: state.infobar,
        widgets: state.widgets,
        activeCustomer: getActiveCustomer(state),
        activeCustomerId: getActiveCustomerId(state),
        sources: getSources(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            infobar: bindActionCreators(InfobarActions, dispatch),
            widgets: bindActionCreators(WidgetActions, dispatch),
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerInfobarContainer)
