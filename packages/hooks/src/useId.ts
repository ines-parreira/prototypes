import { useState } from 'react'

import _uniqueId from 'lodash/uniqueId'

export function useId() {
    const [id] = useState(_uniqueId)
    return id
}
