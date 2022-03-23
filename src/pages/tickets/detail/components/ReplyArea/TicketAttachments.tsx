import React, {Component, MouseEvent} from 'react'
import classnames from 'classnames'
import Lightbox from 'react-images'
import type {List} from 'immutable'

import {fileIconFromContentType} from '../../../common/utils'
import shortcutManager from '../../../../../services/shortcutManager/index'
import MoneyAmount from '../../../../common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import {proxifyURL} from '../../../../../utils'

import {ShopifyProductCardContentType} from '../../../../../constants/integrations/shopify'

import css from './TicketAttachments.less'

type Attachment = Map<any, any>

type Props = {
    attachments: List<Attachment>
    removable: boolean
    deleteAttachment?: (number: number) => void
    className?: string
}

type State = {
    isLightboxOpen: boolean
    currentImage: number
}

export default class TicketAttachments extends Component<Props, State> {
    static defaultProps = {
        removable: false,
    }

    state = {
        isLightboxOpen: false,
        currentImage: 0,
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

    removeAttachment = (idx: number, e: MouseEvent<HTMLElement>) => {
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

    isImage = (attachment?: Attachment) => {
        return (
            !!attachment &&
            (attachment.get('content_type') as string).startsWith('image/')
        )
    }

    isProductCard = (attachment?: Attachment) => {
        return (
            !!attachment &&
            (attachment.get('content_type') as string) ===
                ShopifyProductCardContentType
        )
    }

    setImagePreview = (attachment: Attachment) => {
        if (!(this.isImage(attachment) || this.isProductCard(attachment))) {
            return undefined
        }

        try {
            return {
                backgroundImage: `url(${proxifyURL(
                    attachment.get('url') as string,
                    '120x80'
                )})`,
            }
        } catch (error) {
            return undefined
        }
    }

    openLightbox = (
        e: MouseEvent<HTMLAnchorElement>,
        attachment: Attachment,
        images: List<Attachment>
    ) => {
        if (!this.isImage(attachment)) {
            return
        }

        e.preventDefault()

        this.setState({
            isLightboxOpen: true,
            currentImage: images.findIndex(
                (curImage) => curImage!.get('url') === attachment.get('url')
            ),
        })

        // pause hotkeys
        shortcutManager.pause()
    }

    closeLightbox = () => {
        this.setState({
            isLightboxOpen: false,
        })

        shortcutManager.unpause()
    }

    gotoImage = (index: number) => {
        this.setState({currentImage: index})
    }

    _renderProductAttachment(attachment: Attachment, idx: number) {
        return (
            <div className={css.productCard}>
                <div className={css.productImageContainer}>
                    <img
                        src={proxifyURL(
                            attachment.get('url') as string,
                            '80x80'
                        )}
                        alt={attachment.get('name')}
                    />
                </div>
                <div className={css.productDetail}>
                    <p className={css.productName}>{attachment.get('name')}</p>
                    <p className={css.variantName}>
                        {(attachment.get('extra') as Map<any, any>).get(
                            'variant_name'
                        )}
                    </p>
                    <div className={css.productPrice}>
                        <MoneyAmount
                            renderIfZero
                            amount={(
                                attachment.get('extra') as Map<any, any>
                            ).get('price')}
                            currencyCode={(
                                attachment.get('extra') as Map<any, any>
                            ).get('currency')}
                        />
                    </div>
                </div>
                <a
                    href={
                        (attachment.get('extra') as Map<any, any>).get(
                            'product_link'
                        ) || '#'
                    }
                    className={css.productMeta}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className={css.metaName}>
                        {attachment.get('name')}
                        <br />
                        {(attachment.get('extra') as Map<any, any>).get(
                            'variant_name'
                        )}
                    </div>

                    {this.renderAttachmentIcon(attachment.get('content_type'))}

                    {this.renderRemoveIcon(idx)}
                </a>
            </div>
        )
    }

    _renderDefaultAttachment(
        attachment: Attachment,
        idx: number,
        images: List<any>
    ) {
        return (
            <a
                href={attachment.get('url') || '#'}
                target="_blank"
                className={classnames(css.item, {
                    [css.hasPreview]: this.isImage(attachment),
                })}
                style={this.setImagePreview(attachment)}
                onClick={(e) => this.openLightbox(e, attachment, images)}
                rel="noopener noreferrer"
            >
                <div className={css.itemMeta}>
                    <div className={css.metaName}>{attachment.get('name')}</div>

                    {this.renderAttachmentIcon(attachment.get('content_type'))}

                    {this.renderRemoveIcon(idx)}
                </div>
            </a>
        )
    }

    render() {
        const {attachments, className} = this.props
        const {currentImage, isLightboxOpen} = this.state

        if (attachments.isEmpty()) {
            return null
        }
        const images = attachments.filter(
            this.isImage || this.isProductCard
        ) as List<any>

        const failedAttachments = attachments.filter(
            (attachment) => attachment!.get('public') === false
        )
        const publicAttachments = attachments.filter(
            (attachment) => attachment!.get('public') !== false
        )

        return (
            <div className={classnames(css.component, className)}>
                {failedAttachments.size > 0 && (
                    <div className="mb-2">
                        <i className="material-icons mr-1">warning</i> There is{' '}
                        {`${failedAttachments.size}`} attachment(s) to this
                        message which we couldn't download.
                    </div>
                )}
                {(publicAttachments as List<any>).map(
                    (attachment: Attachment, idx) => {
                        return (
                            <div key={idx} className={css.attachmentContainer}>
                                {this.isProductCard(attachment)
                                    ? this._renderProductAttachment(
                                          attachment,
                                          idx!
                                      )
                                    : this._renderDefaultAttachment(
                                          attachment,
                                          idx!,
                                          images
                                      )}
                            </div>
                        )
                    }
                )}

                <Lightbox
                    images={images
                        .map((image: Map<any, any>) => {
                            return {
                                src: proxifyURL(image.get('url')),
                                caption: image.get('name'),
                            }
                        })
                        .toJS()}
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
