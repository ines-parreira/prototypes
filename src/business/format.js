// @flow
import _trim from 'lodash/trim'
import _upperFirst from 'lodash/upperFirst'

export function humanize(text: string): string {
    return _upperFirst(
        _trim(text, '.-_')
            .replace(/([A-Z])/g, ' $1')
            .replace(/[-_.\s]+/g, ' ')
            .toLowerCase()
    )
}
