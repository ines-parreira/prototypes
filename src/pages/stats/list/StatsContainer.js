import {connect} from 'react-redux'

import {bindActionCreators} from 'redux'

import StatsView from './components/StatsView'

import * as StatsActions from '../../../state/stats/actions'

const mapStateToProps = (state) => ({
    stats: state.stats
})

const mapDispatchToProps = (dispatch) => ({
    actions: {
        stats: bindActionCreators(StatsActions, dispatch),
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(StatsView)
