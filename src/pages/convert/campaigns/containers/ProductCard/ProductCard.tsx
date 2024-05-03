import React, {useState} from 'react'
import {getLuminance, lighten, darken} from 'color2k'

import {updateCampaignProductPosition} from 'state/newMessage/actions'
import useAppDispatch from 'hooks/useAppDispatch'

import {AttachmentPosition} from '../../types/CampaignAttachment'

import {ProductCardView} from './components/ProductCardView'
import {ProductCardEdit} from './components/ProductCardEdit'

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
    color?: string
    currency?: string
    image?: string
    price: number
    productId: number
    title: string
    hasOptions?: boolean
    isHeadlessStore?: boolean
    position?: AttachmentPosition
}

export const ProductCard = ({
    color,
    currency,
    image,
    isHeadlessStore,
    position,
    price,
    productId,
    title,
    hasOptions,
}: Props) => {
    const dispatch = useAppDispatch()
    const [isEditOn, setIsEdit] = useState(false)

    const handleClickEdit = () => setIsEdit(true)
    const handleClickCancel = () => setIsEdit(false)
    const handleSaveEdit = (position: AttachmentPosition) => {
        dispatch(updateCampaignProductPosition({productId, position}))
        setIsEdit(false)
    }

    if (isEditOn && image) {
        return (
            <ProductCardEdit
                bgColor={getBackgroundColorVariant(color || DEFAULT_COLOR)}
                image={image}
                position={position}
                onClickCancel={handleClickCancel}
                onClickSave={handleSaveEdit}
            />
        )
    }

    return (
        <ProductCardView
            bgColor={color || DEFAULT_COLOR}
            currency={currency}
            image={image}
            isHeadlessStore={isHeadlessStore}
            position={position}
            price={price}
            title={title}
            hasOptions={hasOptions}
            onClickEdit={handleClickEdit}
        />
    )
}
