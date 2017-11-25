import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _upperFirst from 'lodash/upperFirst'

import OverviewStatsView from './StatsView'
import {setFilter, fetchStat} from '../../state/stats/actions'
import {getDisplayName} from '../../state/users/helpers'
import {getAgents} from '../../state/users/selectors'
import {getTags} from '../../state/tags/selectors'
import {views as statViewsConfig} from '../../config/stats'
import {CHANNELS} from '../../config/ticket'


const mapStateToProps = (state, props) => {
    const view = props.params.view || 'overview'
    const config = statViewsConfig.get(view)
    const statNames = config.get('stats')

    return {
        tags: getTags(state).toJS(),
        channels: CHANNELS.map(channel => ({
            label: _upperFirst(channel.replace('-', ' ')),
            value: channel,
        })),
        agents: getAgents(state).map(agent => ({
            label: getDisplayName(agent),
            value: agent.get('id'),
        })).toJS(),
        stats: state.stats.filter((stat, statName) => statNames.includes(statName)),
        meta: state.stats.getIn(['_internal', 'meta'], fromJS({})),
        filters: state.stats.getIn(['_internal', 'filters'], fromJS({})),
        isLoading: state.stats.getIn(['_internal', 'loading', 'stats']),
        config,
    }
}

export default connect(mapStateToProps, {setFilter, fetchStat})(OverviewStatsView)
