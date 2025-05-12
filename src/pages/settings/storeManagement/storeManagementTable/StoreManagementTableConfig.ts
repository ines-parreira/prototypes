export enum StoreManagementTableColumn {
    StoreName = 'store_name',
    StoreUrl = 'store_url',
    Channels = 'store_channels',
}

export const TableLabels: Record<StoreManagementTableColumn, string> = {
    [StoreManagementTableColumn.StoreName]: 'STORE NAME',
    [StoreManagementTableColumn.StoreUrl]: 'STORE URL',
    [StoreManagementTableColumn.Channels]: 'CHANNELS',
}

export const columnsOrder: StoreManagementTableColumn[] = [
    StoreManagementTableColumn.StoreName,
    StoreManagementTableColumn.StoreUrl,
    StoreManagementTableColumn.Channels,
]
