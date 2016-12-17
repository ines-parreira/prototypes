import React, {Component, PropTypes} from 'react'
import {mapFileFormatToSemanticIcon} from '../../../utils'

export default class AddAttachmentsAction extends Component {

    _openFileBrowser = () => {
        this.refs.FileInput.click()
    }

    _addAttachments = (event) => {
        this.props.addAttachments(this.props.index, event.target.files)
    }

    _removeAttachment = (fileIndex) => {
        this.props.removeAttachment(this.props.index, fileIndex)
    }

    // Render uploaded attachments
    _renderAttachments() {
        return this.props.action.getIn(['arguments', 'attachments']).map((file, index) => (
            <a key={index} className="ui label mb5i mr5i">
                <i className={`${mapFileFormatToSemanticIcon(file.get('content_type'))} icon`}/>
                {file.get('name')}
                <i className="remove icon ml10i mr0i" onClick={() => this._removeAttachment(index)}/>
            </a>
        ))
    }

    render() {
        const {isLoading, deleteAction, index} = this.props
        return (
            <div>
                <i className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4 className="inline">ATTACH FILES</h4>
                {this._renderAttachments()}
                {isLoading
                    ? <div className="ui small inline active loader loader-no-dimmer"></div>
                    : null}
                <div className="ticket-tag-add-btn ui button ml10i" onClick={this._openFileBrowser}>
                    <i className="plus icon"/>
                    ADD FILES
                </div>
                <input className="hidden" ref="FileInput"type="file" multiple
                    onChange={this._addAttachments}
                />
                <div className="ui divider"></div>
            </div>
        )
    }
}

AddAttachmentsAction.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    action: PropTypes.object.isRequired,
    addAttachments: PropTypes.func.isRequired,
    removeAttachment: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
