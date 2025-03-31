import { Tooltip, TooltipProps } from '@gorgias/merchant-ui-kit'

type Props = {
    id: string
    item: string
    tooltip: string | null
    placement?: TooltipProps['placement']
}

const ItemWithTooltip = ({ id, item, tooltip, placement }: Props) => {
    return (
        <div>
            <div id={id}>{item}</div>
            <Tooltip target={id} placement={placement}>
                {tooltip}
            </Tooltip>
        </div>
    )
}

export default ItemWithTooltip
