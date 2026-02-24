import { useEffect, useRef } from 'react'

import type { AttachmentDTO } from '@gorgias/convert-client'

import { highlightFakeLinks } from 'AIJourney/utils/highlightFakeLinks/highlightFakeLinks'
import type { Image } from 'constants/integrations/types/shopify'

import { GeneratingMessage } from '../GeneratingMessage/GeneratingMessage'
import { PlaygroundPreviewHeader } from '../PlaygroundPreviewHeader/PlaygroundPreviewHeader'

import css from './PlaygroundPreview.less'

type PlaygroundPreviewProps = {
    content?: string[]
    includeImage?: boolean
    isGeneratingMessages?: boolean
    selectedProductImage?: Maybe<Image>
    isCampaign?: boolean
    campaignImage?: AttachmentDTO
}

export const PlaygroundPreview = ({
    content,
    includeImage = false,
    isGeneratingMessages = false,
    selectedProductImage,
    isCampaign,
    campaignImage,
}: PlaygroundPreviewProps) => {
    const previewBodyRef = useRef<HTMLDivElement>(null)

    const shouldIncludeFlowImage =
        !isCampaign && includeImage && !!selectedProductImage?.src
    const shouldIncludeCampaignImage =
        isCampaign && campaignImage && !!campaignImage?.url

    useEffect(() => {
        if (previewBodyRef.current) {
            previewBodyRef.current.scrollTop =
                previewBodyRef.current.scrollHeight
        }
    }, [content])

    return (
        <div className={css.previewContainer}>
            <PlaygroundPreviewHeader />
            <div className={css.previewBody} ref={previewBodyRef}>
                {!isGeneratingMessages &&
                    (!content || content.length === 0) && (
                        <div className={css.messageBubble}>
                            <i
                                className="material-icons-outlined"
                                style={{ marginRight: '6px' }}
                            >
                                auto_awesome
                            </i>
                            AI agent ready to preview messages
                        </div>
                    )}
                {content?.map((message, index) => (
                    <div className={css.followUpMessage} key={index}>
                        <span>
                            {index === 0
                                ? 'Today'
                                : `${index * 24} hours later`}
                        </span>
                        <div className={css.messageBubble}>
                            {index === 0 && shouldIncludeFlowImage && (
                                <div className={css.attachedImage}>
                                    <img
                                        src={selectedProductImage.src}
                                        alt={
                                            selectedProductImage.alt ??
                                            'selected-product-image'
                                        }
                                    />
                                </div>
                            )}
                            {index === 0 && shouldIncludeCampaignImage && (
                                <div className={css.attachedImage}>
                                    <img
                                        src={campaignImage?.url}
                                        alt={
                                            campaignImage?.name ??
                                            'selected-product-image'
                                        }
                                    />
                                </div>
                            )}
                            {highlightFakeLinks(message, css.fakeLink)}
                        </div>
                    </div>
                ))}
                {isGeneratingMessages && <GeneratingMessage />}
            </div>
        </div>
    )
}
