import history from 'pages/history'

import { PartialOptionsParams } from './context'

export function updateUrlWithSearchParams(params: PartialOptionsParams) {
    const currentParams = new URLSearchParams(location.search)

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            currentParams.set(key, value.toString())
        } else {
            currentParams.delete(key)
        }
    })

    history.replace({
        search: currentParams.toString(),
    })
}
