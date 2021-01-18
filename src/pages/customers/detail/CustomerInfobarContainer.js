import React from 'react'
import {withRouter} from 'react-router-dom'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import Infobar from '../../common/components/infobar/Infobar'

import * as WidgetActions from '../../../state/widgets/actions.ts'
import * as InfobarActions from '../../../state/infobar/actions.ts'

import {
    getActiveCustomer,
    getActiveCustomerId,
} from '../../../state/customers/selectors.ts'
import {getSources} from '../../../state/widgets/selectors.ts'

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
            isEditingWidgets,
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
                isRouteEditingWidgets={!!isEditingWidgets}
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
    isEditingWidgets: PropTypes.bool,
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
        },
    }
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(CustomerInfobarContainer)
)
