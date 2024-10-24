import _uniqueId from 'lodash/uniqueId'
import {useState} from 'react'

export default function useId() {
    const [id] = useState(_uniqueId)
    return id
}
