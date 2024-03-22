export const convertSecondsToHours = (
    seconds?: string | number | null
): string => {
    if (!seconds) {
        return '0'
    }

    const secondsNumber = Number(seconds) || 0

    const hours = secondsNumber / 3600
    return (Math.round(hours * 10) / 10).toString()
}

export const formatValue = (val: string) => {
    const inputNumber = Number(val.replace(/[^0-9.]/g, ''))

    const hasDecimalTail = val.slice(-1) === '.'

    const costValue = val
        ? inputNumber.toLocaleString(undefined, {
              maximumFractionDigits: 2,
          }) + (hasDecimalTail ? '.' : '')
        : ''

    return costValue
}

export const formatOnFocus = (
    setValue: (val: string | number) => void,
    val: string | number
) => {
    setValue(Number(val.toString().replace(/[^0-9.]/g, '')) || 0)
}
export const formatOnBlur = (
    setValue: (val: string | number) => void,
    val: string | number
) => {
    setValue(`${Number(val.toString().replace(/[^0-9.]/g, '')) || 0}hrs`)
}

export const getResolutionTimeWithAutomate = (val: string | number) => {
    const resolutionTime = Number(val.toString().replace(/[^0-9.]/g, '')) || 0
    const resolutionTimeWithAutomate = resolutionTime * 0.7

    return Math.round(resolutionTimeWithAutomate * 10) / 10 || '(X)'
}

export const getFirstResponseTimeWithAutomate = (val: string | number) => {
    const firstResponseTime =
        Number(val.toString().replace(/[^0-9.]/g, '')) || 0
    const firstResponseTimeWithAutomate = firstResponseTime * 0.7
    return Math.round(firstResponseTimeWithAutomate * 10) / 10 || '(X)'
}
