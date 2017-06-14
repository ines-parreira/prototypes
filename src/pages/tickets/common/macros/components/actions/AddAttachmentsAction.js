import React, {Component, PropTypes} from 'react'
import {fromJS} from 'immutable'

import FileField from '../../../../../common/forms/FileField'

import {mapFileFormatToSemanticIcon} from '../../../utils'

export default class AddAttachmentsAction extends Component {
    _addAttachments = (files) => {
        this.props.addAttachments(this.props.index, files)
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
                <FileField
                    placeholder="Select files..."
                    onChange={this._addAttachments}
                    inline
                    multiple
                    noPreview
                    returnFiles
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
