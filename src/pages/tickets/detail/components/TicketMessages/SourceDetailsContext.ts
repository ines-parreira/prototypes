import _noop from 'lodash/noop'
import {createContext} from 'react'

export default createContext({setFocus: _noop})
