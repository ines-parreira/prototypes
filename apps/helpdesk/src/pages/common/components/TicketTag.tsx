import { ComponentProps } from 'react'

import { TicketTagDecorationProperty } from '@gorgias/helpdesk-types'

import { Tag } from 'components/Tag/Tag'
import { isValidColor } from 'utils/colors'

type Props = {
    className?: string
    decoration?: TicketTagDecorationProperty
    text: string
    title?: string
} & ComponentProps<typeof Tag>

const TicketTag = ({ text, className, decoration, title, ...props }: Props) => {
    const tagColor = decoration?.color

    const color =
        tagColor && isValidColor(tagColor) ? tagColor.trim() : undefined

    return (
        <Tag
            className={className}
            text={text}
            title={title}
            color={color}
            {...props}
        />
    )
}

export default TicketTag
