import { useState } from 'react'

import {
    Box,
    Icon,
    Image,
    Modal,
    OverlayContent,
    OverlayHeader,
} from '@gorgias/axiom'

import css from './SkillsVideo.less'

const SKILLS_VIDEO_LEGEND = 'Skills for AI Agent'
const SKILLS_VIDEO_SRC = 'https://fast.wistia.net/embed/iframe/wcktmr0zwn'
const SKILLS_VIDEO_POSTER =
    'https://embed-ssl.wistia.com/deliveries/73b02dd243f1d0e7342a68033e388d9d.jpg?image_crop_resized=960x540'

type Props = {
    // Plays the video in place rather than in a modal. Use inside overlays
    // (e.g. a SidePanel), where a nested modal would render outside the overlay
    // and dismiss it on interaction.
    inline?: boolean
}

const Poster = ({
    className,
    onPlay,
}: {
    className: string
    onPlay: () => void
}) => (
    <Box
        as="button"
        type="button"
        className={`${css.trigger} ${className}`}
        onClick={onPlay}
        aria-label={`Play ${SKILLS_VIDEO_LEGEND} video`}
    >
        <Image
            src={SKILLS_VIDEO_POSTER}
            alt=""
            fit="cover"
            width="100%"
            height="100%"
            fallback={null}
        />
        <Box
            className={css.playIcon}
            alignItems="center"
            justifyContent="center"
        >
            <Icon name="media-play-circle" size="lg" />
        </Box>
    </Box>
)

const VideoFrame = () => (
    <Box width="100%" className={css.video}>
        <iframe
            src={`${SKILLS_VIDEO_SRC}?autoPlay=true`}
            title={SKILLS_VIDEO_LEGEND}
            allow="autoplay; fullscreen"
            allowFullScreen
        />
    </Box>
)

export const SkillsVideo = ({ inline = false }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isInlinePlaying, setIsInlinePlaying] = useState(false)

    if (inline) {
        return isInlinePlaying ? (
            <VideoFrame />
        ) : (
            <Poster
                className={css.video}
                onPlay={() => setIsInlinePlaying(true)}
            />
        )
    }

    return (
        <>
            <Poster
                className={css.thumbnail}
                onPlay={() => setIsModalOpen(true)}
            />
            <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="xl">
                <OverlayHeader title={SKILLS_VIDEO_LEGEND} />
                <OverlayContent>
                    <VideoFrame />
                </OverlayContent>
            </Modal>
        </>
    )
}
