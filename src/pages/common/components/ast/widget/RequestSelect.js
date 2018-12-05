//@flow
import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'
import {Input} from 'reactstrap'

import Select from './Select'

import * as requestActions from '../../../../../state/requests/actions'
import {getRequests} from '../../../../../state/requests/selectors'

type Props = {
    onChange: Function,
    value: ?Object,
    actions: Object,
    requests: Object
}

type State = {
    loading: boolean
}

export class RequestSelect extends React.Component<Props, State> {
    state = {
        loading: false
    }

    componentDidMount() {
        const {actions, requests} = this.props

        if (requests.isEmpty()) {
            this.setState({loading: true})
            actions.fetchRequests().then(() => {
                this.setState({loading: false})
            })
        }
    }

    // Update the rule with the first request when requests are fetched
    componentWillReceiveProps(nextProps: Props) {
        const {value, onChange} = this.props

        if (!value && !nextProps.requests.isEmpty()) {
            const firstOption = this._getOptions(nextProps.requests).first()
            onChange(firstOption.get('value').toString())
        }
    }

    _getOptions = (requests: Object = fromJS([])) => {
        return requests.map((r) => (fromJS({
            value: r.get('id'),
            label: r.get('name')
        }))).toList()
    }

    render() {
        const {value, onChange, requests} = this.props
        const {loading} = this.state
        const options = this._getOptions(requests)

        if (loading) {
            return (
                <Input
                    type="text"
                    placeholder="Loading requests..."
                    readOnly
                />
            )
        }

        return (
            <Select
                value={value}
                onChange={(value) => onChange(parseInt(value))}
                options={options.toJS()}
            />
        )
    }
}

//$FlowFixMe
export default connect(
    (state) => ({
        requests: getRequests(state)
    }),
    (dispatch) => ({
        actions: bindActionCreators(requestActions, dispatch)
    })
)(RequestSelect)
