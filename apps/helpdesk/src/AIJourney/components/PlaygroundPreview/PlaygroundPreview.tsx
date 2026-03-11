import { useEffect, useRef } from 'react'

import { Box, Button, Card, Heading, Separator, Size } from '@gorgias/axiom'
import type { AttachmentDTO } from '@gorgias/convert-client'

import { PlaygroundPreviewAttachedImage } from 'AIJourney/components/PlaygroundPreviewAttachedImage/PlaygroundPreviewAttachedImage'
import { PlaygroundPreviewMessagePlaceholder } from 'AIJourney/components/PlaygroundPreviewMessagePlaceholder/PlaygroundPreviewMessagePlaceholder'
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
    onGenerateMessages?: () => void
}

export const PlaygroundPreview = ({
    content,
    includeImage = false,
    isGeneratingMessages = false,
    selectedProductImage,
    isCampaign,
    campaignImage,
    onGenerateMessages,
}: PlaygroundPreviewProps) => {
    const previewBodyRef = useRef<HTMLDivElement>(null)

    const shouldIncludeFlowImage =
        !isCampaign && includeImage && !!selectedProductImage?.src
    const shouldIncludeCampaignImage =
        isCampaign && campaignImage && !!campaignImage?.url

    const shouldRenderMessagePlaceholder =
        !isGeneratingMessages && (!content || content.length === 0)

    useEffect(() => {
        if (previewBodyRef.current) {
            previewBodyRef.current.scrollTop =
                previewBodyRef.current.scrollHeight
        }
    }, [content])

    return (
        <Box flexDirection="column" flex={1}>
            <Box flexDirection="column" width="100%">
                <Box padding={Size.Md}>
                    <Heading>Message preview</Heading>
                </Box>
                <Separator />
            </Box>
            <Box
                flexDirection="column"
                alignItems="center"
                paddingLeft={Size.Md}
                paddingRight={Size.Md}
                paddingTop={Size.Lg}
                paddingBottom={Size.Lg}
                gap={Size.Lg}
                flex={1}
            >
                <Card
                    width="100%"
                    flex={1}
                    flexDirection="column"
                    alignItems="center"
                    padding={0}
                    gap={0}
                >
                    <PlaygroundPreviewHeader />
                    <Box
                        ref={previewBodyRef}
                        className={css.messagesContainer}
                        width="100%"
                        flex={1}
                        flexDirection="column"
                        gap={Size.Lg}
                        padding={Size.Lg}
                    >
                        {shouldRenderMessagePlaceholder && (
                            <PlaygroundPreviewMessagePlaceholder />
                        )}
                        {content?.map((message, index) => (
                            <Box
                                flexDirection="column"
                                gap={Size.Xs}
                                alignItems="center"
                                className={css.followUpMessage}
                                key={index}
                            >
                                <span>
                                    {index === 0
                                        ? 'Today'
                                        : `${index * 24} hours later`}
                                </span>
                                <Box
                                    flexDirection="column"
                                    alignSelf="flex-start"
                                    padding={Size.Sm}
                                    className={css.messageBubble}
                                >
                                    {index === 0 && shouldIncludeFlowImage && (
                                        <PlaygroundPreviewAttachedImage
                                            src={selectedProductImage.src}
                                            alt={
                                                selectedProductImage.alt ??
                                                'selected-product-image'
                                            }
                                        />
                                    )}
                                    {index === 0 &&
                                        shouldIncludeCampaignImage && (
                                            <PlaygroundPreviewAttachedImage
                                                src={campaignImage?.url}
                                                alt={
                                                    campaignImage?.name ??
                                                    'selected-product-image'
                                                }
                                            />
                                        )}
                                    {highlightFakeLinks(message, css.fakeLink)}
                                </Box>
                            </Box>
                        ))}
                        {isGeneratingMessages && <GeneratingMessage />}
                    </Box>
                </Card>
                <Button variant="secondary" onClick={onGenerateMessages}>
                    Preview messages
                </Button>
            </Box>
        </Box>
    )
}
