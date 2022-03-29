function isNumeric(n: number | string) {
    return !isNaN(parseFloat(n as string)) && isFinite(n as number)
}

export function creditCardNormalizer(value: string, previousValue: string) {
    const newValue = value.replace(/ /g, '')
    if ((isNumeric(newValue) && newValue.length <= 19) || !newValue) {
        return newValue.replace(/(\d){4}/g, (match) => `${match} `).trim()
    }
    return previousValue
}

export function creditCardCVCNormalizer(value: string, previousValue: string) {
    if (/^\d{0,4}$/.test(value)) {
        return value
    }
    return previousValue
}

export function creditCardExpDateNormalizer(
    value: string,
    previousValue: string
) {
    const newValue = value.replace(/[ /]/g, '')
    if ((isNumeric(newValue) && newValue.length <= 4) || !newValue) {
        // user type backyard and cursor is at `MM / ` <--
        if (value.length === 4) {
            return newValue
        }
        // user has entered the month
        if (newValue.length >= 2) {
            return newValue.replace(/^(\d){2}/, (match) => `${match} / `)
        }

        return newValue
    }
    return previousValue
}
