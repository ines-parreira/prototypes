import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {BlankState} from './components/BlankState'
import {fetchStats} from '../../../../state/stats/actions'

class BlankStateContainer extends React.Component {
    componentWillMount() {
        this.props.fetchStats()
    }

    render() {
        const {message, stats} = this.props

        return (
            <BlankState
                message={message}
                stats={stats}
            />
        )
    }
}

BlankStateContainer.propTypes = {
    fetchStats: PropTypes.func.isRequired,

    stats: PropTypes.object,
    message: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
}

function mapStateToProps(state) {
    return {
        stats: state.stats
    }
}

function mapDispatchToProps(dispatch) {
    return {
        fetchStats: bindActionCreators(fetchStats, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BlankStateContainer)
