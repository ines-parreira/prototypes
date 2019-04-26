import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _upperFirst from 'lodash/upperFirst'

import moment from 'moment'

import * as statsActions from '../../state/stats/actions'
import {getDisplayName} from '../../state/customers/helpers'
import {getAgents} from '../../state/agents/selectors'
import {getTags} from '../../state/tags/selectors'
import {views as statViewsConfig} from '../../config/stats'
import {CHANNELS} from '../../config/ticket'

import StatsView from './StatsView'

const mapStateToProps = (state, props) => {
    const view = props.params.view || 'overview'
    const config = statViewsConfig.get(view)
    const statNames = config.get('stats')
    let meta = state.stats.getIn(['_internal', 'meta'], fromJS({}))

    // default period: last 7 days
    if (meta.isEmpty()) {
        meta = fromJS({
            'start_datetime': moment().startOf('day').subtract(6, 'days').format(),
            'end_datetime': moment().endOf('day').format()
        })
    }

    return {
        tags: getTags(state).toJS(),
        channels: CHANNELS.map((channel) => ({
            label: _upperFirst(channel.replace('-', ' ')),
            value: channel,
        })),
        agents: getAgents(state).map((agent) => ({
            label: getDisplayName(agent),
            value: agent.get('id'),
        })).toJS(),
        stats: state.stats.filter((stat, statName) => statNames.includes(statName)),
        meta,
        filters: state.stats.getIn(['_internal', 'filters'], fromJS({})),
        config,
    }
}

const actions = {
    setMeta: statsActions.setMeta,
    setFilters: statsActions.setFilters,
    fetchStat: statsActions.fetchStat
}
export default connect(mapStateToProps, actions)(StatsView)
