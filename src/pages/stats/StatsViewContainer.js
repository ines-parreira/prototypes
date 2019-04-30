import {connect} from 'react-redux'
import _upperFirst from 'lodash/upperFirst'

import * as statsActions from '../../state/stats/actions'
import {getDisplayName} from '../../state/customers/helpers'
import {getAgents} from '../../state/agents/selectors'
import {getTags} from '../../state/tags/selectors'
import {views as statViewsConfig} from '../../config/stats'
import {CHANNELS} from '../../config/ticket'
import {getFilters} from '../../state/stats/selectors'

import StatsView from './StatsView'

const mapStateToProps = (state, props) => {
    const view = props.params.view || 'overview'
    const config = statViewsConfig.get(view)
    const statNames = config.get('stats')

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
        filters: getFilters(state),
        config,
    }
}

const actions = {
    fetchStat: statsActions.fetchStat,
    setFilters: statsActions.setFilters,
    resetFilters: statsActions.resetFilters
}
export default connect(mapStateToProps, actions)(StatsView)
