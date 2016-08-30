import React, {PropTypes} from 'react'
import ParametersEditor from '../ParametersEditor'

export default class HttpAction extends React.Component {
    componentDidMount() {
        $(`#method-${this.props.index}`).dropdown({
            onChange: (value) => {
                this.props.updateActionArgs(
                    this.props.index,
                    this.props.action.get('arguments').set('method', value)
                )
            }
        }).dropdown('set value', this.props.action.getIn(['arguments', 'method']))
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
            this.props.action.get('arguments').set('url', url)
        )
    }

    setHeaders(headers) {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments').set('headers', headers)
        )
    }

    setParams(params) {
        this.props.updateActionArgs(
            this.props.index,
            this.props.action.get('arguments').set('params', params)
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
                        <input type="text" value={action.get('title')}
                               onChange={(e) => this.setTitle(e.target.value)}
                        />
                    </div>
                    <div className="fields">
                        <div className="three wide field">
                            <label>Method</label>
                            <div id={`method-${this.props.index}`} className="ui selection dropdown">
                                <input type="hidden" name="gender" />
                                <i className="dropdown icon" />
                                <div className="text">{action.getIn(['arguments', 'method']).toUpperCase()}</div>
                                <div className="menu">
                                    <div className="item" data-value="get">GET</div>
                                    <div className="item" data-value="post">POST</div>
                                    <div className="item" data-value="put">PUT</div>
                                    <div className="item" data-value="delete">DELETE</div>
                                </div>
                            </div>
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
