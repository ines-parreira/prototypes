import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {bindActionCreators} from 'redux'
import _upperFirst from 'lodash/upperFirst'

import {USER_CHANNEL_CLASS} from '../../../config'
import OverviewStatsView from './components/OverviewStatsView'
import {setFilter, fetchStats} from '../../../state/stats/actions'

const mapStateToProps = (state) => ({
    tags: state.tags.get('items', fromJS([])).map(tag => ({label: tag.get('name'), value: tag.get('id')})).toJS(),
    channels: Object.keys(USER_CHANNEL_CLASS).map(channel => ({label: _upperFirst(channel), value: channel})),
    agents: state.users.get('agents', fromJS([])).map(tag => ({label: tag.get('name'), value: tag.get('id')})).toJS(),
    stats: state.stats.get('overview', fromJS({})),
    meta: state.stats.getIn(['_internal', 'meta'], fromJS({})),
    filters: state.stats.getIn(['_internal', 'filters'], fromJS({})),
    isLoading: state.stats.getIn(['_internal', 'loading', 'stats']),
})

const mapDispatchToProps = (dispatch) => ({
    setFilter: bindActionCreators(setFilter, dispatch),
    fetchStats: bindActionCreators(fetchStats, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(OverviewStatsView)
