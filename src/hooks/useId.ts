import {useState} from 'react'
import _uniqueId from 'lodash/uniqueId'

export default function useId() {
    const [id] = useState(_uniqueId)
    return id
}
