export enum ButtonRenderMode {
    Visible = 'visible',
    DisabledWithTooltip = 'disabled-with-tooltip',
    Hidden = 'hidden',
}

export type TriggerProps = React.ComponentPropsWithRef<'button'>

export type StoreIntegrationItem = {
    id: string
    name: string
    isAction?: boolean
}

export type StoreSection = {
    id: string
    name: string
    items: StoreIntegrationItem[]
}

export type DuplicateGuidanceProps = {
    isDisabled?: boolean
    renderMode?: ButtonRenderMode
    tooltipMessage?: string
    onChange?: (selectedStores: StoreIntegrationItem[]) => void
    shopName?: string
    articleIds: number[]
    trigger?: (props: TriggerProps) => React.ReactNode
    placement?: 'bottom' | 'bottom left' | 'bottom right'
    onDuplicate: (
        articleIds: number[],
        shopNames: string[],
    ) => Promise<{
        success: boolean
        shopNames?: string[]
    }>
}
