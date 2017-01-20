import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import throttle from 'lodash/throttle'
import {BlankState} from './components/BlankState'
import {fetchStats} from '../../../../state/stats/actions'

const _fetch = throttle((props) => {
    props.fetchStats(
        {
            type: 'agents',
            period: 'last-7-days',
            start_datetime: null,
            end_datetime: null,
        },
        {
            agents: [
                props.currentUser.get('id')
            ]
        }
    )
}, 15000)

class BlankStateContainer extends React.Component {
    componentWillMount() {
        _fetch(this.props)
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
    currentUser: PropTypes.object,
    message: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
}

function mapStateToProps(state) {
    return {
        stats: state.stats,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        fetchStats: bindActionCreators(fetchStats, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BlankStateContainer)
