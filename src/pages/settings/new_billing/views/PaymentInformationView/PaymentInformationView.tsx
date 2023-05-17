import React, {useEffect} from 'react'

type Props = {
    setBreadcrumbItems: (breadcrumbItems: (JSX.Element | string)[]) => void
}

const PaymentInformationView = ({setBreadcrumbItems}: Props) => {
    useEffect(() => {
        setBreadcrumbItems(['Payment Information'])
    }, [setBreadcrumbItems])

    return (
        <div>
            <h1>PaymentInformationView</h1>
        </div>
    )
}

export default PaymentInformationView
