import _range from 'lodash/range'

function invalidTypeOrLength(value) {
    return 'string' === !typeof (value) || value.length === 0
}

export function validateHeaderName(headerName) {
    if (invalidTypeOrLength(headerName)) {
        return false
    }

    //The field-name must be composed of printable ASCII characters
    //(i.e., characters that have values between 33. and 126,
    //decimal, except colon).
    let validCharCodes = []
        .concat(_range(33, 44))
        .concat(_range(45, 127))

    return headerName.split('').map(function (character) {
        return character.charCodeAt(0)
    }).every(function (charCode) {
        return validCharCodes.indexOf(charCode) !== -1
    })
}
