import { useToggle } from '@gorgias/toolkit-react'

import {
    Box,
    Button,
    Menu,
    MenuItem,
    Modal,
    OverlayFooter,
    OverlayHeader,
    SubMenu,
    Text,
} from '@gorgias/axiom'

import { useAudioPlayer } from '../../../hooks/useAudioPlayer'

import css from './AudioPlayer.less'

type AudioPlayerProps = {
    url: string
    initialDuration?: number
    onDelete?: () => void
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer({
    url,
    initialDuration = 0,
    onDelete,
}: AudioPlayerProps) {
    const {
        isOpen: isDeleteModalOpen,
        open: openDeleteModal,
        close: closeDeleteModal,
    } = useToggle()
    const {
        audioRef,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        handlePlayPause,
        handleSeek,
        handleVolumeChange,
        handleMuteToggle,
        handleDownload,
        handleSpeedChange,
        onTimeUpdate,
        onLoadedMetadata,
        onEnded,
    } = useAudioPlayer({ url, initialDuration })

    return (
        <>
            <div className={css.playerContainer}>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio
                    ref={audioRef}
                    src={url}
                    preload="none"
                    onTimeUpdate={onTimeUpdate}
                    onLoadedMetadata={onLoadedMetadata}
                    onEnded={onEnded}
                />

                <Button
                    icon={
                        isPlaying ? 'media-pause-circle' : 'media-play-circle'
                    }
                    variant="secondary"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    onClick={handlePlayPause}
                />

                <div className={css.progressSection}>
                    <Text as="span" size="sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </Text>
                    <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className={css.progressBar}
                        aria-label="Seek"
                        style={
                            {
                                '--seek-percent': `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                            } as React.CSSProperties
                        }
                    />
                </div>

                <Menu
                    trigger={
                        <Button
                            icon={
                                isMuted || volume === 0
                                    ? 'media-volume-off'
                                    : 'media-volume-max'
                            }
                            variant="tertiary"
                            aria-label="Volume"
                        />
                    }
                    aria-label="Volume controls"
                >
                    <MenuItem asSlot isDisabled={false}>
                        <Box
                            flexDirection="row"
                            alignItems="center"
                            gap="xxxs"
                            pt="xs"
                            pl="xxxs"
                            pr="xs"
                        >
                            <Button
                                icon={
                                    isMuted
                                        ? 'media-volume-max'
                                        : 'media-volume-off'
                                }
                                variant="tertiary"
                                size="sm"
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                                onClick={handleMuteToggle}
                            />
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Volume level"
                                className={css.volumeRange}
                                style={
                                    {
                                        '--volume-percent': `${(isMuted ? 0 : volume) * 100}%`,
                                    } as React.CSSProperties
                                }
                            />
                        </Box>
                    </MenuItem>
                </Menu>

                <Menu
                    trigger={
                        <Button
                            icon="dots-meatballs-horizontal"
                            variant="tertiary"
                            aria-label="More options"
                        />
                    }
                >
                    <MenuItem
                        id="download"
                        label="Download"
                        leadingSlot="download"
                        onAction={handleDownload}
                    />
                    <SubMenu
                        label="Playback speed"
                        leadingSlot="media-play-circle"
                    >
                        {PLAYBACK_SPEEDS.map((speed) => (
                            <MenuItem
                                key={speed}
                                id={`speed-${speed}`}
                                label={`${speed}x`}
                                onAction={() => handleSpeedChange(speed)}
                            />
                        ))}
                    </SubMenu>
                    {onDelete && (
                        <MenuItem
                            id="delete"
                            leadingSlot="trash-empty"
                            label="Delete"
                            onAction={openDeleteModal}
                            intent="destructive"
                        />
                    )}
                </Menu>
            </div>

            {onDelete && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onOpenChange={closeDeleteModal}
                    size="sm"
                >
                    <OverlayHeader
                        title="Delete recording"
                        description="This action cannot be undone."
                    />
                    <OverlayFooter>
                        <Button
                            variant="primary"
                            intent="destructive"
                            onClick={() => {
                                onDelete()
                                closeDeleteModal()
                            }}
                        >
                            Delete
                        </Button>
                    </OverlayFooter>
                </Modal>
            )}
        </>
    )
}
