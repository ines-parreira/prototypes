import {SOURCE_VALUE_PROP} from '../../../config'

export function displayUserNameFromSource(user, sourceType) {
    const valueProp = SOURCE_VALUE_PROP[sourceType]
    const value = user[valueProp]

    let label = user.name || value

    // if is email channel and has a name, show the address next to the name
    if (sourceType === 'email') {
        if (user.name) {
            label = `${user.name} <${value}>`
        } else {
            label = value
        }
    }

    return label
}
