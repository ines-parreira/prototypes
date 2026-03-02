import type { CSSProperties } from 'react'
import { useMemo } from 'react'

import type { AttachmentPosition } from 'pages/convert/campaigns/types/CampaignAttachment'
import { Draggable } from 'utils/wrappers/Draggable'
import type { DraggableEventHandler } from 'utils/wrappers/Draggable'

import { getDraggableContainerBounds } from './utils'

import css from './ImagePosition.less'

export const VISIBLE_IMAGE_CONTAINER = {
    width: 280,
    height: 220,
}

export type FeaturedImage = {
    src: string
    width: number
    height: number
}

type Props = Omit<AttachmentPosition, 'offsetX' | 'offsetY'> & {
    readonly?: boolean
    image: FeaturedImage
    onDrag?: (x: number, y: number) => void
}

export const ImagePosition = ({
    readonly = false,
    image,
    size,
    x,
    y,
    onDrag,
}: Props) => {
    const { src, ...imageSize } = image

    const imageStyle = useMemo<CSSProperties>(() => {
        if (!image) {
            return {}
        }

        if (readonly) {
            if (size > 0 || x !== 0 || y !== 0) {
                return {
                    ...imageSize,
                    backgroundImage: `url("${src}"), linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(22, 22, 22, 0.1) 100%)`,
                    backgroundPosition: `${x}px ${y}px`,
                    backgroundSize: `${size}%`,
                }
            }

            return {
                backgroundImage: `url("${src}"), linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(22, 22, 22, 0.1) 100%)`,
            }
        }

        return {
            ...imageSize,
            backgroundImage: `url("${src}"), linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(22, 22, 22, 0.1) 100%)`,
            backgroundPosition: `${x}px ${y}px`,
            backgroundSize: `${size}%`,
        }
    }, [image, readonly, imageSize, src, x, y, size])

    const handleDrag: DraggableEventHandler = (_event, data) => {
        const { y, x } = data

        onDrag && onDrag(x, y)
    }

    const containerStyles = {
        width: `${VISIBLE_IMAGE_CONTAINER.width}px`,
        height: `${VISIBLE_IMAGE_CONTAINER.height}px`,
    }

    const draggableContainerBounds = getDraggableContainerBounds(
        imageSize,
        VISIBLE_IMAGE_CONTAINER,
        size,
    )

    return (
        <>
            {!readonly && (
                <Draggable
                    handle=".cursor"
                    defaultPosition={{
                        x: x ?? 0,
                        y: y ?? 0,
                    }}
                    onDrag={handleDrag}
                    bounds={draggableContainerBounds}
                >
                    <div
                        className={`${css.boundingBox} cursor`}
                        style={imageSize}
                    />
                </Draggable>
            )}
            <div className={css.visibleContainer} style={containerStyles}>
                <div
                    className={css.visibleImage}
                    style={{ ...containerStyles, ...imageStyle }}
                />
            </div>
        </>
    )
}
