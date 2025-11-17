import { useEffect, useState } from 'react'

import { useMeasure } from '@repo/hooks'
import { darken, getLuminance, lighten } from 'color2k'

import useAppDispatch from 'hooks/useAppDispatch'
import type { AttachmentPosition } from 'pages/convert/campaigns/types/CampaignAttachment'
import { updateCampaignProductPosition } from 'state/newMessage/actions'

import { ProductCardEdit } from './components/ProductCardEdit'
import { ProductCardView } from './components/ProductCardView'

import css from './ProductCard.less'

const COLOR_VARIANT = 0.1
const COLOR_LUMINANCE_THRESHOLD = 0.5
const DEFAULT_COLOR = '#0097ff'

function getBackgroundColorVariant(mainColor: string): string {
    if (getLuminance(mainColor) > COLOR_LUMINANCE_THRESHOLD) {
        return darken(mainColor, COLOR_VARIANT)
    }
    return lighten(mainColor, COLOR_VARIANT)
}

type Props = {
    isHighlighted?: boolean
    color?: string
    currency?: string
    imageSrc?: string
    price: number
    compareAtPrice?: number
    productId: number
    title: string
    hasOptions?: boolean
    isHeadlessStore?: boolean
    position?: AttachmentPosition
    shouldHideRepositionImage: boolean
    onClick?: () => void
}

export const ProductCard = ({
    isHighlighted,
    color,
    currency,
    imageSrc,
    isHeadlessStore,
    position,
    price,
    compareAtPrice,
    productId,
    title,
    hasOptions,
    shouldHideRepositionImage,
    onClick = () => null,
}: Props) => {
    const dispatch = useAppDispatch()
    const [isEditOn, setIsEdit] = useState(false)
    const [hiddenImageRef, { width, height }] = useMeasure<HTMLImageElement>()

    const handleClickEdit = () => setIsEdit(true)
    const handleClickCancel = () => setIsEdit(false)
    const handleSaveEdit = (position: AttachmentPosition) => {
        dispatch(updateCampaignProductPosition({ productId, position }))
        setIsEdit(false)
    }

    const image = imageSrc
        ? {
              src: imageSrc,
              width,
              height,
          }
        : undefined

    // If the product card is not highlighted anymore, exit editMode
    useEffect(() => {
        if (!isHighlighted && isEditOn) {
            setIsEdit(false)
        }
    }, [isHighlighted, isEditOn])

    return (
        <>
            <img
                ref={hiddenImageRef}
                className={css.hiddenImage}
                src={imageSrc}
                alt=""
            />
            {isEditOn && image ? (
                <ProductCardEdit
                    bgColor={getBackgroundColorVariant(color || DEFAULT_COLOR)}
                    image={image}
                    position={position}
                    onClickCancel={handleClickCancel}
                    onClickSave={handleSaveEdit}
                />
            ) : (
                <ProductCardView
                    isHighlighted={!!isHighlighted}
                    bgColor={color || DEFAULT_COLOR}
                    currency={currency}
                    image={image}
                    isHeadlessStore={isHeadlessStore}
                    position={position}
                    price={price}
                    compareAtPrice={compareAtPrice}
                    title={title}
                    hasOptions={hasOptions}
                    shouldHideRepositionImage={shouldHideRepositionImage}
                    onClickEdit={handleClickEdit}
                    onClick={onClick}
                />
            )}
        </>
    )
}
