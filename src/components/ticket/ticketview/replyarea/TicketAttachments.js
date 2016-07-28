import React, {PropTypes} from 'react'
import classNames from 'classnames'

export default class TicketAttachments extends React.Component {
    // only re-render if we have a different set of attachments
    shouldComponentUpdate = (nextProps) => !this.props.attachments.equals(nextProps.attachments)

    renderAttachmentIcon(contentType) {
        let iconClass = 'attach'
        let iconLabel = ''

        if (contentType === 'application/pdf') {
            iconClass = 'file pdf outline'
            iconLabel = 'pdf'
        } else if (contentType.startsWith('image/')) {
            iconClass = 'file image outline'
            // extract image type
            iconLabel = contentType.replace('image/', '')
        } else if (contentType === 'application/msword') {
            iconClass = 'file word outline'
            iconLabel = 'word'
        } else if (contentType.startsWith('text/')) {
            iconClass = 'file text outline'
            iconLabel = 'text'
        }

        return (
            <div className="attachments-item-meta-type">
                <i className={`icon ${iconClass}`}/>
                {iconLabel}
            </div>
        )
    }

    removeAttachment(idx) {
        return (e) => {
            this.props.deleteAttachment(idx)

            // prevent opening the thumb
            // when clicking the delete button
            e.preventDefault()
        }
    }

    renderRemoveIcon(idx) {
        if (this.props.removable) {
            return <i className="attachments-item-remove remove action icon" onClick={this.removeAttachment(idx)}/>
        }
        return null
    }

    setImagePreview(attachment) {
        if (!attachment.content_type.startsWith('image/')) {
            return null
        }

        return {
            backgroundImage: `url(${attachment.url})`
        }
    }

    render() {
        const {attachments} = this.props
        if (attachments.isEmpty()) {
            return null
        }

        return (
            <div className="attachments">
                {
                    attachments.map((attachment, idx) => (
                        <a href={attachment.url || '#'} target="_blank" className={classNames('attachments-item', {'attachments-item-has-preview': !!(this.setImagePreview(attachment))})} key={idx} style={this.setImagePreview(attachment)}>
                            <div className="attachments-item-meta">
                                <div className="attachments-item-meta-name">
                                    {attachment.name}
                                </div>

                                {this.renderAttachmentIcon(attachment.content_type)}

                                {this.renderRemoveIcon(idx)}
                            </div>
                        </a>
                    ))
                }
            </div>
        )
    }
}

TicketAttachments.propTypes = {
    attachments: PropTypes.object.isRequired,
    removable: PropTypes.bool.isRequired,
    deleteAttachment: PropTypes.func
}
