import React from 'react'

import {useLocation} from 'react-router-dom'
import history from 'pages/history'
import Button from 'pages/common/components/button/Button'

export default function CreateActionButton() {
    const location = useLocation()

    function handleClick() {
        history.push(`${location.pathname}/new`)
    }
    return <Button onClick={handleClick}>Create Action</Button>
}
