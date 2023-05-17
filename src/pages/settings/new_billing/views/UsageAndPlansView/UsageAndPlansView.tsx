import React, {useEffect} from 'react'

type Props = {
    setBreadcrumbItems: (breadcrumbItems: (JSX.Element | string)[]) => void
}

const UsageAndPlansView = ({setBreadcrumbItems}: Props) => {
    useEffect(() => {
        setBreadcrumbItems(['Usage & Plans'])
    }, [setBreadcrumbItems])

    return (
        <div>
            <h1>UsageAndPlansView</h1>
        </div>
    )
}

export default UsageAndPlansView
