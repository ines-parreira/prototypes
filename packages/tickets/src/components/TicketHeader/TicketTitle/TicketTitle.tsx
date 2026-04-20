import { Link } from 'react-router-dom'

import { Breadcrumb, Breadcrumbs } from '@gorgias/axiom'

import { EditableBreadcrumb } from '../../EditableBreadcrumb'

import css from './TicketTitle.less'

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
            <Link className={css.customerLink} to={customerUrl}>
                {customerName}
            </Link>
        </Breadcrumb>
    )
}

type TicketTitleViewProps = {
    viewName: string
    viewUrl: string
}

export function TicketTitleView({ viewName, viewUrl }: TicketTitleViewProps) {
    return (
        <Breadcrumb>
            <Link className={css.viewLink} to={viewUrl}>
                {viewName}
            </Link>
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
