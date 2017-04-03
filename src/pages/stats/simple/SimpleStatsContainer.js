import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {bindActionCreators} from 'redux'

import SimpleStatsView from './components/SimpleStatsView'
import {fetchStats} from '../../../state/stats/actions'

const mapStateToProps = (state, ownProps) => {
    const type = ownProps.params.type

    let fields = []

    // define table columns to display simple data
    switch (type) {
        case 'channels':
            fields = [
                {name: 'name', label: 'Channels'},
                {name: 'count', label: 'New tickets #'},
                {name: 'delta', label: 'New tickets Δ', type: 'delta'},
                {name: 'percentage', label: 'New tickets %', type: 'percent'},
            ]
            break
        case 'agents':
            fields = [
                {name: 'name', label: 'Agents'},
                {name: 'count', label: 'Closed tickets #'},
                {name: 'delta', label: 'Closed tickets Δ', type: 'delta'},
                {name: 'percentage', label: 'Closed tickets %', type: 'percent'},
            ]
            break
        case 'tags':
            fields = [
                {name: 'name', label: 'Tags'},
                {name: 'count', label: 'New tickets #'},
                {name: 'delta', label: 'New tickets Δ', type: 'delta'},
                {name: 'percentage', label: 'New tickets %', type: 'percent'},
            ]
            break
        default:
            break
    }

    return {
        type,
        fields: fromJS(fields),
        // order stats by first value (closed tickets, new tickets, etc.)
        stats: state.stats
            .get(type, fromJS({}))
            .filter(stat => !!stat.get('name')) // remove non identified stats (null, undefined, etc.)
            .sort((a, b) => a.get('count') < b.get('count') ? 1 : -1),
        meta: state.stats.getIn(['_internal', 'meta'], fromJS({})),
        isLoading: state.stats.getIn(['_internal', 'loading', 'stats']),
    }
}

const mapDispatchToProps = (dispatch) => ({
    fetchStats: bindActionCreators(fetchStats, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(SimpleStatsView)
