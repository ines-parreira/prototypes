import React from 'react'

import {Link, useLocation} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'

export default function CreateActionButton() {
    const location = useLocation()

    return (
        <Link to={`${location.pathname}/new`}>
            <Button>Create Action</Button>
        </Link>
    )
}
