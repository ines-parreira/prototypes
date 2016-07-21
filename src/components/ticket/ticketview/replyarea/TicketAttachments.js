import React, {PropTypes} from 'react'

export default class TicketAttachments extends React.Component {
    // only re-render if we have a different set of attachments
    shouldComponentUpdate = (nextProps) => !this.props.attachments.equals(nextProps.attachments)

    renderAttachmentIcon(contentType) {
        let iconType = 'attach'

        if (contentType === 'application/pdf') {
            iconType = 'file pdf outline'
        } else if (contentType.startsWith('image/')) {
            iconType = 'file image outline'
        } else if (contentType === 'application/msword') {
            iconType = 'file word outline'
        } else if (contentType.startsWith('text/')) {
            iconType = 'file text outline'
        }

        return <i className={`icon ${iconType}`}/>
    }

    renderRemoveIcon(idx) {
        if (this.props.removable) {
            return <i className="remove action icon" onClick={() => this.props.deleteAttachment(idx)}/>
        }
        return null
    }

    render() {
        const {attachments} = this.props
        if (attachments.isEmpty()) {
            return null
        }

        return (
            <div className="attachments enumerable-list">
                {
                    attachments.map((attachment, idx) => (
                        <div className="ui label" key={idx}>
                            {this.renderAttachmentIcon(attachment.content_type)}
                            <a href={attachment.url || '#'} target="_blank">{attachment.name}</a>
                            {this.renderRemoveIcon(idx)}
                        </div>
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
