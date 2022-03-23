import React, {Component} from 'react'
import {fromJS, Map} from 'immutable'
import {Badge} from 'reactstrap'

import {fileIconFromContentType} from 'pages/tickets/common/utils'
import FileField from 'pages/common/forms/FileField'
import {Attachment} from 'models/ticket/types'

type Props = {
    index: number
    action: Map<string, unknown>
    addAttachments: (index: number, files: Attachment[]) => void
    removeAttachment: (actionIndex: number, fileIndex: number) => void
}

export default class AddAttachmentsAction extends Component<Props> {
    _addAttachments = (files: Attachment[]) => {
        this.props.addAttachments(this.props.index, files)
    }

    _removeAttachment = (fileIndex: number) => {
        this.props.removeAttachment(this.props.index, fileIndex)
    }

    // Render uploaded attachments
    _renderAttachments() {
        const attachments: Map<any, any> = this.props.action.getIn(
            ['arguments', 'attachments'],
            fromJS([])
        )
        return attachments.map((file: Map<any, any>, index) => {
            return (
                <Badge key={index} color="secondary" className="tag mr-2 mb-1">
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
