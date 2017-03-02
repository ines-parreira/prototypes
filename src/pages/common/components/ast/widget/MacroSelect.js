import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'
import {getActionTemplate} from './../../../../../utils'

import Select from './Select'

import * as macroActions from './../../../../../state/macro/actions'
import {getMacros} from './../../../../../state/macro/selectors'


class MacroSelect extends React.Component {
    componentDidMount() {
        const {actions, macros} = this.props

        if (macros.isEmpty()) {
            actions.fetchMacros()
        }
    }

    render() {
        const {value, onChange, macros} = this.props
        let options = fromJS([])

        macros.filter(macro => macro.get('actions')
                // Filter out macros with external actions
                .filter(action => getActionTemplate(action.get('name')).execution === 'back')
                .isEmpty()
            ).forEach(macro => {
                options = options.push(fromJS({value: macro.get('id'), label: macro.get('name')}))
            })

        if (options.isEmpty()) {
            return (
                <div className="ui input">
                    <input type="text" placeholder="Loading macros..." readOnly="true"/>
                </div>
            )
        }

        return (
            <Select
                value={value}
                onChange={onChange}
                options={options.toJS() || []}
            />
        )
    }
}

MacroSelect.propTypes = {
    actions: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,

    macros: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    macros: getMacros(state)
})

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(macroActions, dispatch)
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MacroSelect)
