function isNumeric(n: number | string) {
    return isFinite(typeof n === 'number' ? n : Number(n))
}

export function creditCardNormalizer(value: string, previousValue: string) {
    const newValue = value.replace(/[\s\.]/g, '')
    if ((isNumeric(newValue) && newValue.length <= 19) || !newValue) {
        return newValue.replace(/\d{4}/g, (match) => `${match} `).trim()
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
        if (value.length === 4 && value.indexOf(' /') > -1) {
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
