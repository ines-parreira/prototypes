import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import {
    Box,
    Button,
    Heading,
    Icon,
    Modal,
    ModalSize,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import css from 'domains/reporting/pages/self-service/VideoPreviewTooltip.less'

interface VideoPreviewTooltipProps {
    children: ReactNode
    videoSrc: string
    videoPoster?: string
    videoDuration?: string
    title: string
    body: string
    learnMoreUrl: string
}

export function VideoPreviewTooltip({
    children,
    videoSrc,
    videoPoster,
    videoDuration,
    title,
    body,
    learnMoreUrl,
}: VideoPreviewTooltipProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = useCallback(() => setIsModalOpen(true), [])
    const closeModal = useCallback(() => setIsModalOpen(false), [])

    // cspell:ignore wistia
    const autoplaySrc = useMemo(() => {
        try {
            const url = new URL(videoSrc)
            if (videoSrc.includes('wistia.net')) {
                url.searchParams.set('autoPlay', 'true')
                url.searchParams.set('muted', 'true')
            }
            return url.toString()
        } catch {
            return videoSrc
        }
    }, [videoSrc])

    return (
        <>
            <div className={css.wrapper}>
                <Tooltip
                    key={String(isModalOpen)}
                    placement="right"
                    delay={600}
                    closeDelay={250}
                    trigger={<div className={css.trigger}>{children}</div>}
                >
                    <TooltipContent>
                        <div data-video-preview-tooltip="true">
                            <div className={css.textBlock}>
                                <div className={css.titleRow}>
                                    <Text size="sm" className={css.title}>
                                        {title}
                                    </Text>
                                    {videoDuration && (
                                        <Text
                                            size="sm"
                                            className={css.duration}
                                        >
                                            {videoDuration}
                                        </Text>
                                    )}
                                </div>
                                <Text size="sm" className={css.body}>
                                    {body}
                                </Text>
                            </div>
                            <div className={css.videoWrapper}>
                                <button
                                    type="button"
                                    className={css.thumbnailButton}
                                    aria-label="Watch video"
                                    onClick={openModal}
                                >
                                    {videoPoster && (
                                        <img
                                            src={videoPoster}
                                            alt="Video thumbnail"
                                            className={css.thumbnailImage}
                                        />
                                    )}
                                    <div className={css.thumbnailOverlay}>
                                        <span
                                            className="material-icons"
                                            style={{ fontSize: 32 }}
                                        >
                                            play_circle_filled
                                        </span>
                                    </div>
                                </button>
                            </div>
                            <a
                                href={learnMoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={css.learnMoreLink}
                            >
                                Learn more
                                <Icon name="external-link" size="sm" />
                            </a>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </div>

            <Modal
                size={ModalSize.Lg}
                isOpen={isModalOpen}
                onOpenChange={(open) => !open && closeModal()}
            >
                <div className={css.modalContent}>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        marginBottom="sm"
                    >
                        <div className={css.textBlock}>
                            <Heading
                                slot="title"
                                size="md"
                                className={css.modalTitle}
                            >
                                {title}
                            </Heading>
                            <Text size="sm" className={css.modalBody}>
                                {body}
                            </Text>
                        </div>
                        <Button
                            icon={<Icon name="close" />}
                            variant="tertiary"
                            size="sm"
                            aria-label="Close"
                            onClick={closeModal}
                        />
                    </Box>
                    <div
                        className={css.modalVideoWrapper}
                        style={
                            videoPoster
                                ? { backgroundImage: `url(${videoPoster})` }
                                : undefined
                        }
                    >
                        {/* tabIndex makes the iframe a valid focus target within React Aria's FocusScope, preventing it from stealing clicks */}
                        {/** iframe used instead of <Video because ReactPlayer is not compatible with our Modal component */}
                        <iframe
                            src={autoplaySrc}
                            title={title}
                            allow="autoplay; fullscreen"
                            allowFullScreen
                            tabIndex={0}
                        />
                    </div>
                    <Box
                        display="flex"
                        justifyContent="flex-end"
                        gap="sm"
                        marginTop="sm"
                    >
                        <Button variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            trailingSlot={<Icon name="external-link" />}
                            onClick={() =>
                                window.open(
                                    learnMoreUrl,
                                    '_blank',
                                    'noopener,noreferrer',
                                )
                            }
                        >
                            Learn more
                        </Button>
                    </Box>
                </div>
            </Modal>
        </>
    )
}
