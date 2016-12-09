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
                {name: 'Channels'},
                {name: 'New tickets #'},
                {name: 'New tickets Δ', type: 'delta'},
                {name: 'New tickets %', type: 'percent'},
            ]
            break
        case 'agents':
            fields = [
                {name: 'Agents'},
                {name: 'Closed tickets #'},
                {name: 'Closed tickets Δ', type: 'delta'},
                {name: 'Closed tickets %', type: 'percent'},
            ]
            break
        case 'tags':
            fields = [
                {name: 'Tags'},
                {name: 'New tickets #'},
                {name: 'New tickets Δ', type: 'delta'},
                {name: 'New tickets %', type: 'percent'},
            ]
            break
        default:
            break
    }

    return {
        type,
        fields: fromJS(fields),
        // order stats by first value (closed tickets, new tickets, etc.)
        stats: state.stats.get(type, fromJS({})).sort((a, b) => a.get(1) < b.get(1) ? 1 : -1),
        meta: state.stats.getIn(['_internal', 'meta'], fromJS({})),
        isLoading: state.stats.getIn(['_internal', 'loading', 'stats']),
    }
}

const mapDispatchToProps = (dispatch) => ({
    fetchStats: bindActionCreators(fetchStats, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(SimpleStatsView)
