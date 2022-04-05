import _range from 'lodash/range'

export function validateHeaderName(headerName: string) {
    if (!headerName) {
        return false
    }

    // via https://tools.ietf.org/html/rfc822.html#section-3.2
    const printableCharCodes = _range(33, 127) // no need to filter out the colon( : ) code here

    // list created using javascript's Header class, by appending each printable ASCII code as a header name
    // and filtering the ones that threw an error (58 is the colon char code)
    const invalidCharCodes = [
        34, 40, 41, 44, 47, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 123, 125,
    ]

    return headerName
        .split('')
        .map(function (character) {
            return character.charCodeAt(0)
        })
        .every(function (charCode) {
            return (
                invalidCharCodes.indexOf(charCode) === -1 &&
                printableCharCodes.indexOf(charCode) !== -1
            )
        })
}
