import React from 'react'
import classNames from 'classnames'
import Lightbox from 'react-images'
import type {List} from 'immutable'

import {fileIconFromContentType} from '../../../common/utils'
import shortcutManager from '../../../../../services/shortcutManager'


type Props = {
    attachments: List<*>,
    removable: boolean,
    deleteAttachment: ({}) => void
}

type State = {
    isLightboxOpen: boolean,
    currentImage: number
}

export default class TicketAttachments extends React.Component<Props, State> {
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
        return attachment.get('content_type').startsWith('image/')
    }

    setImagePreview = (attachment) => {
        if (!this.isImage(attachment)) {
            return null
        }

        if (!window.IMAGE_PROXY_URL) {
            throw new Error('window.IMAGE_PROXY_URL is not defined')
        }

        return {
            backgroundImage: `url(${window.IMAGE_PROXY_URL}120x80/${attachment.get('url')})`
        }
    }

    openLightbox = (e, attachment, images) => {
        if (!this.isImage(attachment)) {
            return
        }

        e.preventDefault()

        this.setState({
            isLightboxOpen: true,
            currentImage: images.findIndex((curImage) => curImage.get('url') === attachment.get('url')),
        })

        // pause hotkeys
        shortcutManager.pause()
    }

    closeLightbox = () => {
        this.setState({
            isLightboxOpen: false
        })

        shortcutManager.unpause()
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
        const failedAttachments = attachments.filter((attachment) => attachment.get('public') === false)
        const publicAttachments = attachments.filter((attachment) => attachment.get('public') !== false)

        return (
            <div className="attachments">
                {
                    failedAttachments.size > 0 && (
                        <div className="mb-2">
                            <i className='fa fa-warning mr-1'/>
                            {' '}There is {`${failedAttachments.size}`} attachment(s) to this message which we{' '}
                            couldn't download.
                        </div>
                    )
                }
                {
                    publicAttachments.map((attachment, idx) => {
                        return (
                            <a
                                href={attachment.get('url') || '#'}
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
                                        {attachment.get('name')}
                                    </div>

                                    {this.renderAttachmentIcon(attachment.get('content_type'))}

                                    {this.renderRemoveIcon(idx)}
                                </div>
                            </a>
                        )
                    })
                }

                <Lightbox
                    images={images.map((image) => {
                        return {
                            src: image.get('url'),
                            caption: image.get('name')
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
