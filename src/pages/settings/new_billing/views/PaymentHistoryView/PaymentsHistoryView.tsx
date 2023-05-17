import React, {useEffect} from 'react'

type Props = {
    setBreadcrumbItems: (breadcrumbItems: (JSX.Element | string)[]) => void
}

const PaymentHistoryView = ({setBreadcrumbItems}: Props) => {
    useEffect(() => {
        setBreadcrumbItems(['Payment History'])
    }, [setBreadcrumbItems])
    return (
        <div>
            <h1>PaymentsHistoryView</h1>
        </div>
    )
}

export default PaymentHistoryView
