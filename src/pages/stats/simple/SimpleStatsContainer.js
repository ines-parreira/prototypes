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
        stats: state.stats.get(type, fromJS({})),
        meta: state.stats.getIn(['_internal', 'meta'], fromJS({})),
        isLoading: state.stats.getIn(['_internal', 'loading', 'stats']),
    }
}

const mapDispatchToProps = (dispatch) => ({
    fetchStats: bindActionCreators(fetchStats, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(SimpleStatsView)
