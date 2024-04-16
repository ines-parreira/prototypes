import React, {useState} from 'react'

import SLAListView from '../views/SLAListView'
import LandingPage from '../../SLATemplateList/views/LandingPage'

export default function SLAListController() {
    const [SLAList] = useState([])

    const hasSLAs = SLAList.length > 0

    return <>{hasSLAs ? <SLAListView /> : <LandingPage />}</>
}
