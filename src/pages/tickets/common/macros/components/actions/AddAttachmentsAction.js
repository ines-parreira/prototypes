import React, {Component, PropTypes} from 'react'
import {fromJS} from 'immutable'

import FileField from '../../../../../common/forms/FileField'

import {fileIconFromContentType} from '../../../utils'

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
                        className="ui label mr-1 mb-1"
                    >
                        <i className={`fa fa-fw ${fileIconFromContentType(file.get('content_type'))} mr-2`} />
                        <span className="mr-2">{file.get('name')}</span>
                        <i
                            className="fa fa-fw fa-close"
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
