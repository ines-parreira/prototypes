import React, {ChangeEvent, useEffect, useMemo, useState} from 'react'

import {getContrastColor} from 'gorgias-design-system/utils'
import {InputRange} from 'pages/common/forms/input/InputRange'

import {AttachmentPosition} from '../../../../types/CampaignAttachment'

import {BaseProductCard} from '../BaseProductCard'
import {
    FeaturedImage,
    ImagePosition,
    VISIBLE_IMAGE_CONTAINER,
} from '../ImagePosition'

import {getDraggableContainerBounds} from '../ImagePosition/utils'
import css from './ProductCardEdit.less'
import {
    convertRangeValueToSize,
    convertSizeToRangeValue,
    getMinRangeSize,
} from './utils'

type Props = {
    bgColor: string
    image: FeaturedImage
    position?: AttachmentPosition
    onClickCancel: () => void
    onClickSave: (position: AttachmentPosition) => void
}

export const ProductCardEdit = ({
    bgColor,
    image,
    position,
    onClickCancel,
    onClickSave,
}: Props) => {
    const minRangeSize = getMinRangeSize(image, VISIBLE_IMAGE_CONTAINER)

    const [size, setSize] = useState(position?.size ?? minRangeSize)

    const [x, setX] = useState(position?.x ?? 0)
    const [y, setY] = useState(position?.y ?? 0)
    const [offsetX, setOffsetX] = useState(position?.offsetX ?? 0)
    const [offsetY, setOffsetY] = useState(position?.offsetY ?? 0)

    const inputRangeValue = convertSizeToRangeValue(size, minRangeSize)

    useEffect(() => {
        if (!position) {
            return
        }

        setSize(position.size)
        setX(position.x)
        setY(position.y)
        setOffsetX(position.offsetX)
        setOffsetY(position.offsetY)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position?.x, position?.y, position?.offsetX, position?.offsetY])

    const buttonStyle = useMemo(
        () => ({
            backgroundColor: bgColor,
            color: getContrastColor(bgColor),
        }),
        [bgColor]
    )

    const handleDrag = (x: number, y: number) => {
        setY(y)
        setOffsetY(y - offsetY)
        setX(x)
        setOffsetX(x - offsetX)
    }

    const handleRangeChange = (ev: ChangeEvent<HTMLInputElement>) => {
        // Do not let user modify the size past a point from which the image would not be 100% within container
        const converted = convertRangeValueToSize(
            Number(ev.target.value),
            minRangeSize
        )
        const adjustedSize = Math.max(minRangeSize, converted)

        // Check if by zooming, image would get out of bounds and translate the image towards
        // the other sign of the axis
        const {left, top} = getDraggableContainerBounds(
            image,
            VISIBLE_IMAGE_CONTAINER,
            adjustedSize
        )

        const newX = Math.max(x, left)
        const newY = Math.max(y, top)

        setX(newX)
        setY(newY)

        setSize(adjustedSize)
    }

    const handleSave = () => {
        onClickSave({
            x,
            y,
            offsetX,
            offsetY,
            size,
        })
    }

    const renderFeaturedImage = () => (
        <ImagePosition
            x={x}
            y={y}
            image={image}
            size={size}
            onDrag={handleDrag}
        />
    )

    return (
        <BaseProductCard renderFeaturedImage={renderFeaturedImage}>
            <div className={css.details}>
                <div className={css.controls}>
                    <InputRange
                        value={inputRangeValue}
                        min={1}
                        max={100}
                        onChange={handleRangeChange}
                    />
                </div>
                <div className={css.btnGroup}>
                    <button
                        className={css.baseButton}
                        style={buttonStyle}
                        onClick={onClickCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className={css.baseButton}
                        style={buttonStyle}
                        onClick={handleSave}
                    >
                        Save Position
                    </button>
                </div>
            </div>
        </BaseProductCard>
    )
}
