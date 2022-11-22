export enum DeviceTypeOperators {
    Desktop = 'desktop',
    Mobile = 'mobile',
    All = 'all',
}

const DEVICE_TYPE_OPERATORS = ['desktop', 'mobile', 'all']

export function isDeviceTypeOperators(
    operator: string
): operator is DeviceTypeOperators {
    return DEVICE_TYPE_OPERATORS.includes(operator)
}
