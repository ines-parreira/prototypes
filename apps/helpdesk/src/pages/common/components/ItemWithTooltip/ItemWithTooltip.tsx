import { Tooltip, TooltipProps } from '@gorgias/axiom'

type Props = {
    id: string
    item: string
    tooltip: string | null
    placement?: TooltipProps['placement']
    className?: string
}

const ItemWithTooltip = ({
    id,
    item,
    tooltip,
    placement,
    className,
}: Props) => {
    return (
        <div className={className}>
            <div id={id}>{item}</div>
            <Tooltip target={id} placement={placement}>
                {tooltip}
            </Tooltip>
        </div>
    )
}

export default ItemWithTooltip
