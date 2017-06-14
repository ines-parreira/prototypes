import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'
import {Input} from 'reactstrap'

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

    // Update the rule with the first macro when macros are fetched
    componentWillReceiveProps(nextProps) {
        const {value, onChange} = this.props

        if (!value && !nextProps.macros.isEmpty()) {
            const firstOption = this._getOptions(nextProps.macros).first()
            onChange(firstOption.get('value').toString())
        }
    }

    _getOptions = (macros = fromJS({})) => {
        // Filter out macros with external actions
        return macros
            .filter(macro => macro.get('actions')
                .filter(action => getActionTemplate(action.get('name')).execution === 'back')
                .isEmpty())
            .map(macro => fromJS({value: macro.get('id'), label: macro.get('name')}))
            .toList()
    }

    render() {
        const {value, onChange, macros} = this.props
        const options = this._getOptions(macros)

        if (options.isEmpty()) {
            return (
                <Input
                    type="text"
                    placeholder="Loading macros..."
                    readOnly
                />
            )
        }

        return (
            <Select
                value={value}
                onChange={onChange}
                options={options.toJS()}
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
