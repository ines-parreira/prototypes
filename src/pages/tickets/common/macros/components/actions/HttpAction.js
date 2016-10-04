import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {AVAILABLE_HTTP_METHODS} from '../../../../../../config'
import ParametersEditor from '../../../../../common/components/ParametersEditor'

export default class HttpAction extends React.Component {
    componentDidMount() {
        $(this.refs.method)
            .dropdown({
                onChange: (value) => {
                    this.props.updateActionArgs(
                        this.props.index,
                        this.props.action.get('arguments', fromJS({})).set('method', value)
                    )
                }
            })
            .dropdown('set selected', this.props.action.getIn(['arguments', 'method']))
    }

    setTitle(title) {
        this.props.updateActionTitle(
            this.props.index,
            title
        )
    }

    setUrl(url) {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments', fromJS({})).set('url', url)
        )
    }

    setHeaders(headers) {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments', fromJS({})).set('headers', headers)
        )
    }

    setParams(params) {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments', fromJS({})).set('params', params)
        )
    }

    render() {
        const {index, action, deleteAction} = this.props

        return (
            <div className="http">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4>SEND HTTP REQUEST</h4>
                <div className="ui form">
                    <div className="field">
                        <label>Action Title</label>
                        <input
                            type="text"
                            value={action.get('title')}
                            onChange={(e) => this.setTitle(e.target.value)}
                        />
                    </div>
                    <div className="fields">
                        <div className="three wide field">
                            <label>Method</label>
                            <select
                                ref="method"
                                className="ui dropdown"
                            >
                                {
                                    AVAILABLE_HTTP_METHODS.map((method) =>
                                        <option
                                            key={method}
                                            value={method}
                                        >
                                            {method}
                                        </option>
                                    )
                                }
                            </select>
                        </div>
                        <div className="thirteen wide field">
                            <label>URL</label>
                            <input
                                type="text"
                                value={action.getIn(['arguments', 'url'])}
                                onChange={e => this.setUrl(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label>Headers</label>
                        <ParametersEditor
                            list={action.getIn(['arguments', 'headers'])}
                            updateDict={headers => this.setHeaders(headers)}
                        />
                    </div>
                    <div className="field">
                        <label>Parameters</label>
                        <ParametersEditor
                            list={action.getIn(['arguments', 'params'])}
                            updateDict={params => this.setParams(params)}
                        />
                    </div>
                </div>
                <div className="ui divider"></div>
            </div>
        )
    }
}

HttpAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    updateActionTitle: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
