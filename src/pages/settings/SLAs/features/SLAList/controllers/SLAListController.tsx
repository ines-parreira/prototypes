import React, {useState} from 'react'

import SLAListView from '../views/SLAListView'
import SLAEmptyState from '../views/SLAEmptyState'

export default function SLAListController() {
    const [SLAList] = useState([])

    const hasSLAs = SLAList.length > 0

    return <>{hasSLAs ? <SLAListView /> : <SLAEmptyState />}</>
}
