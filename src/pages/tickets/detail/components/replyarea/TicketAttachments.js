import React, {PropTypes} from 'react'
import classNames from 'classnames'
import Lightbox from 'react-images'

import {fileIconFromContentType} from '../../../common/utils'

export default class TicketAttachments extends React.Component {
    state = {
        isLightboxOpen: false,
        currentImage: 0
    }

    renderAttachmentIcon = (contentType) => {
        return (
            <div className="attachments-item-meta-type">
                <i className={`fa fa-fw ${fileIconFromContentType(contentType)}`} />
            </div>
        )
    }

    removeAttachment = (idx, e) => {
        this.props.deleteAttachment(idx)

        // prevent opening the thumb when clicking the delete button
        e.preventDefault()
        e.stopPropagation()
    }

    renderRemoveIcon = (idx) => {
        if (this.props.removable) {
            return (
                <i
                    className="attachments-item-remove fa fa-fw fa-close"
                    onClick={(e) => this.removeAttachment(idx, e)}
                />
            )
        }

        return null
    }

    isImage = (attachment) => {
        return attachment.content_type.startsWith('image/')
    }

    setImagePreview = (attachment) => {
        if (!this.isImage(attachment)) {
            return null
        }

        if (!window.IMAGE_PROXY_URL) {
            throw new Error('window.IMAGE_PROXY_URL is not defined')
        }

        return {
            backgroundImage: `url(${window.IMAGE_PROXY_URL}120x80/${attachment.url})`
        }
    }

    openLightbox = (e, attachment, images) => {
        if (!this.isImage(attachment)) {
            return
        }

        e.preventDefault()

        this.setState({
            isLightboxOpen: true,
            currentImage: images.indexOf(attachment),
        })
    }

    closeLightbox = () => {
        this.setState({
            isLightboxOpen: false
        })
    }

    gotoImage = (index) => {
        this.setState({currentImage: index})
    }

    render() {
        const {attachments} = this.props
        const {currentImage, isLightboxOpen} = this.state

        if (attachments.isEmpty()) {
            return null
        }

        const images = attachments.filter(this.isImage)

        return (
            <div className="attachments">
                {
                    attachments.map((attachment, idx) => (
                        <a
                            href={attachment.url || '#'}
                            target="_blank"
                            className={classNames('attachments-item', {
                                'attachments-item-has-preview': this.isImage(attachment)
                            })}
                            key={idx}
                            style={this.setImagePreview(attachment)}
                            onClick={(e) => this.openLightbox(e, attachment, images)}
                        >
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

                <Lightbox
                    images={images.map((image) => {
                        return {
                            src: image.url,
                            caption: image.name
                        }
                    }).toJS()}
                    isOpen={isLightboxOpen}
                    currentImage={currentImage}
                    onClickPrev={() => this.gotoImage(currentImage - 1)}
                    onClickNext={() => this.gotoImage(currentImage + 1)}
                    onClose={this.closeLightbox}
                    onClickThumbnail={this.gotoImage}
                    showThumbnails
                    backdropClosesModal
                />
            </div>
        )
    }
}

TicketAttachments.propTypes = {
    attachments: PropTypes.object.isRequired,
    removable: PropTypes.bool.isRequired,
    deleteAttachment: PropTypes.func
}
