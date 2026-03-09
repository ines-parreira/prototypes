import type { ComponentProps } from 'react'

import { isValidColor } from '@repo/utils'

import type { UpdateTicketTag } from '@gorgias/helpdesk-types'

import { Tag } from 'components/Tag/Tag'

type Props = {
    className?: string
    decoration?: UpdateTicketTag['decoration'] | null
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
