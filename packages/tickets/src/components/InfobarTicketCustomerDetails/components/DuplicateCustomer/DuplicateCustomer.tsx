import { Banner, Button, Icon } from '@gorgias/axiom'

export interface DuplicateCustomerProps {
    onClick?: () => void
}

export function DuplicateCustomer({ onClick }: DuplicateCustomerProps) {
    return (
        <Banner
            title="Potential duplicate customer found"
            icon={<Icon name="arrow-merging" size="lg" />}
        >
            <Button variant="secondary" onClick={onClick} size="sm">
                View customer
            </Button>
        </Banner>
    )
}
