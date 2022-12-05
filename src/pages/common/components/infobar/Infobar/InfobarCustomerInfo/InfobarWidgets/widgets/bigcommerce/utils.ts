import {BigCommerceCustomerAddress} from './types'

export const buildAddressComponent = (
    addressObj: Maybe<BigCommerceCustomerAddress>,
    includeCountry = true
): string => {
    let address = ''

    if (!addressObj) {
        return address
    }

    if (addressObj.postal_code) {
        address = `${addressObj.postal_code} ${addressObj.city}`
    } else {
        address = addressObj.city
    }
    if (addressObj.state_or_province) {
        address = `${address}, ${addressObj.state_or_province}`
    }
    if (includeCountry) {
        address = `${address}, ${addressObj.country_code}, ${addressObj.country}`
    }

    return address
}

export const getOneLineAddress = (
    addressObj: Maybe<BigCommerceCustomerAddress>
): string => {
    let address = ''

    if (!addressObj) {
        return address
    }

    address = `${addressObj.first_name} ${addressObj.last_name}, ${addressObj.address1}`
    if (addressObj.address2) {
        address = `${address} ${addressObj.address2}`
    }
    if (addressObj.phone) {
        address = `${address}, ${addressObj.phone}`
    }
    address = `${address}, ${buildAddressComponent(addressObj)}`

    return address
}
