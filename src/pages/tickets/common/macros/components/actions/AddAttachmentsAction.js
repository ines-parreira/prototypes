import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import {Badge} from 'reactstrap'

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
        return this.props.action
            .getIn(['arguments', 'attachments'], fromJS([]))
            .map((file, index) => {
                return (
                    <Badge
                        key={index}
                        color="secondary"
                        className="tag mr-2 mb-1"
                    >
                        <i className="material-icons mr-2">
                            {fileIconFromContentType(file.get('content_type'))}
                        </i>
                        <span className="mr-2">{file.get('name')}</span>
                        <i
                            className="material-icons clickable"
                            onClick={() => this._removeAttachment(index)}
                        >
                            close
                        </i>
                    </Badge>
                )
            })
    }

    render() {
        return (
            <div>
                {this._renderAttachments()}
                <FileField
                    placeholder={
                        <span>
                            <i className="material-icons mr-1">attach_file</i>
                            Select files...
                        </span>
                    }
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
