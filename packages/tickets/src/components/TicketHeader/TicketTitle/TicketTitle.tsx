import { Link } from 'react-router-dom'

import { Breadcrumb, Breadcrumbs } from '@gorgias/axiom'

import { EditableBreadcrumb } from '../../EditableBreadcrumb'

type TicketTitleProps = {
    children: React.ReactNode
}

export function TicketTitle({ children }: TicketTitleProps) {
    return <Breadcrumbs>{children}</Breadcrumbs>
}

type TicketTitleCustomerProps = {
    customerName: string
    customerUrl: string
}

export function TicketTitleCustomer({
    customerName,
    customerUrl,
}: TicketTitleCustomerProps) {
    return (
        <Breadcrumb>
            <Link to={customerUrl}>{customerName}</Link>
        </Breadcrumb>
    )
}

type TicketTitleSubjectProps = {
    value: string | null
    placeholder?: string
    onChange?: (value: string) => void
}

export function TicketTitleSubject({
    value,
    placeholder,
    onChange,
}: TicketTitleSubjectProps) {
    return (
        <Breadcrumb asSlot>
            <EditableBreadcrumb
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </Breadcrumb>
    )
}
