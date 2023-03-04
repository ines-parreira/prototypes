import React, {CSSProperties, useMemo} from 'react'
import {useMeasure} from 'react-use'

import Draggable, {DraggableEventHandler} from 'react-draggable'

import {AttachmentPosition} from '../../../../types/CampaignAttachment'

import css from './ImagePosition.less'

type Props = Omit<AttachmentPosition, 'offsetX' | 'offsetY'> & {
    readonly?: boolean
    image: string
    onDrag?: (x: number, y: number, width: number, height: number) => void
}

export const ImagePosition = ({
    readonly = false,
    image,
    size,
    x,
    y,
    onDrag,
}: Props) => {
    const [ref, {width, height}] = useMeasure<HTMLImageElement>()

    const imageStyle = useMemo<CSSProperties>(() => {
        if (!image) {
            return {}
        }

        const base = {
            width,
            height,
        }

        if (readonly) {
            if (size > 0 && x !== 0 && y !== 0) {
                return {
                    ...base,
                    backgroundImage: `url("${image}"), linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(22, 22, 22, 0.1) 100%)`,
                    backgroundPosition: `${x}px ${y}px`,
                    backgroundSize: `${size}%`,
                }
            }

            return {
                backgroundImage: `url("${image}"), linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(22, 22, 22, 0.1) 100%)`,
            }
        }

        return {
            ...base,
            backgroundImage: `url("${image}"), linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(22, 22, 22, 0.1) 100%)`,
            backgroundPosition: `${x}px ${y}px`,
            backgroundSize: `${size}%`,
        }
    }, [readonly, image, y, x, width, height, size])

    const handleDrag: DraggableEventHandler = (event, data) => {
        const {y, x} = data
        onDrag && onDrag(x, y, width, height)
    }

    if (readonly) {
        return (
            <>
                <img ref={ref} className={css.hiddenImage} src={image} alt="" />
                <div className={css.visibleContainer}>
                    <div className={css.visibleImage} style={imageStyle} />
                </div>
            </>
        )
    }

    return (
        <>
            <img ref={ref} className={css.hiddenImage} src={image} alt="" />
            <Draggable
                handle=".cursor"
                defaultPosition={{
                    x: x ?? 0,
                    y: y ?? 0,
                }}
                onDrag={handleDrag}
            >
                <div
                    className={`${css.boundingBox} cursor`}
                    style={{width, height}}
                ></div>
            </Draggable>
            <div className={css.visibleContainer}>
                <div className={css.visibleImage} style={imageStyle} />
            </div>
        </>
    )
}
