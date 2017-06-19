import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {bindActionCreators} from 'redux'
import _upperFirst from 'lodash/upperFirst'

import OverviewStatsView from './components/OverviewStatsView'
import {setFilter, fetchStats} from '../../../state/stats/actions'
import {getDisplayName} from '../../../state/users/helpers'
import {getAgents} from '../../../state/users/selectors'
import {getTags} from '../../../state/tags/selectors'

const CHANNELS = ['email', 'phone', 'chat', 'facebook', 'api']

const mapStateToProps = (state) => ({
    tags: getTags(state).toJS(),
    channels: CHANNELS.map(channel => ({
        label: _upperFirst(channel.replace('-', ' ')),
        value: channel,
    })),
    agents: getAgents(state).map(agent => ({
        label: getDisplayName(agent),
        value: agent.get('id'),
    })).toJS(),
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
