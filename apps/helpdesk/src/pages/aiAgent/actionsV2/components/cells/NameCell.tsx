import { Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import { ACTION_NAME_MAX_LENGTH } from '../../constants'

type Props = {
    name: string
}

const truncate = (value: string) => {
    if (value.length <= ACTION_NAME_MAX_LENGTH) return value
    return `${value.slice(0, ACTION_NAME_MAX_LENGTH).trimEnd()}…`
}

const NameCell = ({ name }: Props) => {
    const display = truncate(name)
    const isTruncated = display !== name
    const label = (
        <Text as="span" variant="medium" overflow="ellipsis">
            {display}
        </Text>
    )

    if (!isTruncated) return label

    return (
        <Tooltip trigger={label}>
            <TooltipContent caption={name} />
        </Tooltip>
    )
}

export { NameCell }
