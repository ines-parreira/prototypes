import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import * as ViewsActions from '../../../state/views/actions.ts'
import Navbar from '../../common/components/Navbar'
import {getSettingsByType} from '../../../state/currentUser/selectors.ts'

import CustomersNavbarView from './components/CustomersNavbarView'

class CustomerNavbarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        const viewId = this.props.params.viewId
            ? this.props.params.viewId
            : this.props.location.query.viewId
        this.props.actions.fetchViews(viewId)
    }

    render() {
        return (
            <Navbar activeContent="customers">
                <CustomersNavbarView
                    settingType="customer-views"
                    setting={this.props.setting}
                    isLoading={this.props.isLoading}
                />
            </Navbar>
        )
    }
}

CustomerNavbarContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.shape({
        query: PropTypes.object,
    }),
    setting: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => {
    return {
        setting: getSettingsByType('customer-views')(state),
        isLoading: state.currentUser.getIn(
            ['_internal', 'loading', 'settings', 'customer-views'],
            false
        ),
    }
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ViewsActions, dispatch),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomerNavbarContainer)
