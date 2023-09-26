import React, {ChangeEvent, useEffect, useMemo, useState} from 'react'

import {InputRange} from 'pages/common/forms/input/InputRange'

import {getContrastColor} from 'gorgias-design-system/utils'
import {AttachmentPosition} from '../../../../types/CampaignAttachment'

import {BaseProductCard} from '../BaseProductCard'
import {ImagePosition} from '../ImagePosition'

import css from './ProductCardEdit.less'

type Props = {
    bgColor: string
    image: string
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
    const [size, setSize] = useState(position?.size ?? 100)

    const [x, setX] = useState(position?.x ?? 0)
    const [y, setY] = useState(position?.y ?? 0)
    const [offsetX, setOffsetX] = useState(position?.offsetX ?? 0)
    const [offsetY, setOffsetY] = useState(position?.offsetY ?? 0)

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
        setSize(parseInt(ev.target.value))
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
                        value={size}
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
