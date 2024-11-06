import {createContext} from 'react'

import type Client from './Client'

export default createContext<Client | null>(null)
