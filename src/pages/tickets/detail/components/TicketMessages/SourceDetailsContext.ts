import { createContext } from 'react'

import _noop from 'lodash/noop'

export default createContext({ setFocus: _noop })
