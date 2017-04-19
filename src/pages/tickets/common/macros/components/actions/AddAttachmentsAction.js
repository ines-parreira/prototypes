import React, {Component, PropTypes} from 'react'
import {fromJS} from 'immutable'
import {mapFileFormatToSemanticIcon} from '../../../utils'

export default class AddAttachmentsAction extends Component {
    state = {
        isLoading: false,
    }

    _openFileBrowser = () => {
        this.refs.fileInput.click()
    }

    _addAttachments = (event) => {
        this.setState({isLoading: true})
        this.props.addAttachments(this.props.index, event.target.files)
            .then(() => this.setState({isLoading: false}))
    }

    _removeAttachment = (fileIndex) => {
        this.props.removeAttachment(this.props.index, fileIndex)
    }

    // Render uploaded attachments
    _renderAttachments() {
        return this.props.action.getIn(['arguments', 'attachments'], fromJS([]))
            .map((file, index) => {
                return (
                    <a
                        key={index}
                        className="ui label mb5i mr5i"
                    >
                        <i className={`${mapFileFormatToSemanticIcon(file.get('content_type'))} icon`} />
                        {file.get('name')}
                        <i
                            className="remove icon ml10i mr0i"
                            onClick={() => this._removeAttachment(index)}
                        />
                    </a>
                )
            })
    }

    render() {
        return (
            <div>
                {this._renderAttachments()}
                {this.state.isLoading && <div className="ui small inline active loader loader-no-dimmer" />}
                <div
                    className="ticket-tag-add-btn ui button ml10i"
                    onClick={this._openFileBrowser}
                >
                    <i className="plus icon" />
                    Add files
                </div>
                <input
                    className="hidden"
                    ref="fileInput"
                    type="file"
                    multiple
                    onChange={this._addAttachments}
                />
            </div>
        )
    }
}

AddAttachmentsAction.propTypes = {
    index: PropTypes.number.isRequired,
    action: PropTypes.object.isRequired,
    addAttachments: PropTypes.func.isRequired,
    removeAttachment: PropTypes.func.isRequired,
}
