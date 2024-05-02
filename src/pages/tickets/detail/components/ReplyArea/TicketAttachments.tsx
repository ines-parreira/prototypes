import React, {Component, MouseEvent} from 'react'
import classnames from 'classnames'
import Lightbox from 'react-images'
import type {List, Map} from 'immutable'

import {ShopifyProductCardContentType} from 'constants/integrations/shopify'
import {fileIconFromContentType} from 'pages/tickets/common/utils'
import shortcutManager from 'services/shortcutManager/index'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import {proxifyURL, replaceAttachmentURL} from 'utils'

import {DiscountOfferTicketAttachment} from 'pages/tickets/detail/components/ReplyArea/DiscountOfferTicketAttachment/DiscountOfferTicketAttachment'
import {AttachmentEnum} from 'common/types'
import css from './TicketAttachments.less'

type Attachment = Map<any, any>

type Props = {
    attachments: List<Attachment>
    removable: boolean
    deleteAttachment?: (number: number) => void
    className?: string
    context:
        | 'campaign-message'
        | 'ticket-reply'
        | 'ticket-message'
        | 'embedded-card'
        | 'content-form'
        | 'quick-reply'
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
        this.props.deleteAttachment?.(idx)
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
        const contentType = attachment?.get('content_type') as string
        return (
            !!attachment &&
            !['image/heic', 'image/heif'].includes(contentType) && // We cannot render heif/heic images in the browser CF https://caniuse.com/?search=heif.
            contentType.startsWith('image/')
        )
    }

    isProductCard = (attachment?: Attachment) => {
        return (
            !!attachment &&
            (attachment.get('content_type') as string) ===
                ShopifyProductCardContentType
        )
    }

    isUniqueDiscountOffer = (attachment: Attachment) => {
        return attachment.get('content_type') === AttachmentEnum.DiscountOffer
    }

    setImagePreview = (attachment: Attachment) => {
        if (!(this.isImage(attachment) || this.isProductCard(attachment))) {
            return undefined
        }

        try {
            return {
                backgroundImage: `url(${replaceAttachmentURL(
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
                href={replaceAttachmentURL(attachment.get('url')) || '#'}
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

    _renderUniqueDiscountOfferAttachment(attachment: Attachment, idx: number) {
        const onRemoveAttachment = this.props.removable
            ? (e: MouseEvent<HTMLElement>) => this.removeAttachment(idx, e)
            : undefined

        return (
            <DiscountOfferTicketAttachment
                supportsEdit={this.props.context === 'campaign-message'}
                discountOffer={attachment.toJS()}
                onRemove={onRemoveAttachment}
            />
        )
    }

    renderAttachment = (
        attachment: Attachment,
        index: number,
        images: List<any>
    ) => {
        if (this.isProductCard(attachment)) {
            return this._renderProductAttachment(attachment, index)
        } else if (this.isUniqueDiscountOffer(attachment)) {
            return this._renderUniqueDiscountOfferAttachment(attachment, index)
        }

        return this._renderDefaultAttachment(attachment, index, images)
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
                                {this.renderAttachment(
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
                                src: replaceAttachmentURL(image.get('url')),
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
