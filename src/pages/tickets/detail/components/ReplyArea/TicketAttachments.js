//@flow
import React from 'react'
import classnames from 'classnames'
import Lightbox from 'react-images'
import type {List} from 'immutable'

import {fileIconFromContentType} from '../../../common/utils'
import shortcutManager from '../../../../../services/shortcutManager'

import {proxifyURL} from '../../../../../utils'

import css from './TicketAttachments.less'

// TODO (@pwlmaciejewski): Once we upgrade Immutable to v4 it should be a RecordOf<MessageAttachment>
type Attachment = any

type Props = {
    attachments: List<Attachment>,
    removable: boolean,
    deleteAttachment?: number => void,
    className?: string,
}

type State = {
    isLightboxOpen: boolean,
    currentImage: number
}

export default class TicketAttachments extends React.Component<Props, State> {
    static defaultProps = {
        removable: false
    }

    state = {
        isLightboxOpen: false,
        currentImage: 0
    }

    renderAttachmentIcon = (contentType: string) => {
        return (
            <div className={css.metaType}>
                <i className="material-icons md-2">
                    {fileIconFromContentType(contentType)}
                </i>
            </div>
        )
    }

    removeAttachment = (idx: number, e: SyntheticEvent<*>) => {
        this.props.deleteAttachment && this.props.deleteAttachment(idx)

        // prevent opening the thumb when clicking the delete button
        e.preventDefault()
        e.stopPropagation()
    }

    renderRemoveIcon = (idx: number) => {
        if (this.props.removable) {
            return (
                <i
                    className={classnames(css.itemRemove, 'material-icons')}
                    onClick={(e) => this.removeAttachment(idx, e)}
                >
                    close
                </i>
            )
        }

        return null
    }

    isImage = (attachment: Attachment) => {
        return attachment.get('content_type').startsWith('image/')
    }

    setImagePreview = (attachment: Attachment) => {
        if (!this.isImage(attachment)) {
            return null
        }

        try {
            return {
                backgroundImage: `url(${proxifyURL(attachment.get('url'), '120x80')})`
            }
        } catch (error) {
            return null
        }

    }

    openLightbox = (e: SyntheticEvent<*>, attachment: Attachment, images: List<Attachment>) => {
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

    gotoImage = (index: number) => {
        this.setState({currentImage: index})
    }

    render() {
        const {attachments, className} = this.props
        const {currentImage, isLightboxOpen} = this.state

        if (attachments.isEmpty()) {
            return null
        }

        const images = attachments.filter(this.isImage)
        const failedAttachments = attachments.filter((attachment) => attachment.get('public') === false)
        const publicAttachments = attachments.filter((attachment) => attachment.get('public') !== false)

        return (
            <div className={classnames(css.component, className)}>
                {
                    failedAttachments.size > 0 && (
                        <div className="mb-2">
                            <i className="material-icons mr-1">
                                warning
                            </i>
                            {' '}There is {`${failedAttachments.size}`} attachment(s) to this message which we{' '}
                            couldn't download.
                        </div>
                    )
                }
                {
                    publicAttachments.map((attachment: Attachment, idx) => {
                        return (
                            <a
                                href={attachment.get('url') || '#'}
                                target="_blank"
                                className={classnames(css.item, {
                                    [css.hasPreview]: this.isImage(attachment)
                                })}
                                key={idx}
                                style={this.setImagePreview(attachment)}
                                onClick={(e) => this.openLightbox(e, attachment, images)}
                            >
                                <div className={css.itemMeta}>
                                    <div className={css.metaName}>
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
                            src: proxifyURL(image.get('url')),
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
