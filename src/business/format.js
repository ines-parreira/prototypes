// @flow
import _ from 'lodash'

export function humanize(text: string): string {
    return _.chain<string>(text)
        .trim('.-_')
        .replace(/([A-Z])/g, ' $1')
        .replace(/[-_.\s]+/g, ' ')
        .toLower()
        .upperFirst()
        .value()
}
