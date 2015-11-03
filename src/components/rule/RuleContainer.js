import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import RuleForm from '../../components/rule/RuleForm'
import RuleList from '../../components/rule/RuleList'
import Sidebar from '../../components/rule/Sidebar'
import * as RuleActions from '../../actions/rule'

class RuleBox extends React.Component {
    componentDidMount() {
        const { rules, actions } = this.props
        actions.fetchRules("/api/rules")
    }

    render() {
        const {rules, actions } = this.props

        return (
            <div className="App">
                <Sidebar />

                <div className="content pusher">
                    <div className="ui secondary menu">
                        <div className="right menu">
                            <div className="item">
                                <div className="ui search">
                                    <div className="ui icon input">
                                        <input className="prompt" type="text" placeholder="Search..."/>
                                        <i className="search icon"></i>
                                    </div>
                                    <div className="results"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ui grid">
                        <div className="six column">
                            <RuleList data={rules}/>

                            <h3 className="ui header">Adding a new rule</h3>
                            <RuleForm actions={actions}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        rules: state.rules
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(RuleActions, dispatch)
    }
}

export
default

connect(mapStateToProps,
    mapDispatchToProps)

(
    RuleBox
)
