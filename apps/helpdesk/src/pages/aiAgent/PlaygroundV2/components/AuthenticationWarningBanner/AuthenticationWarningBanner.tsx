import { Banner } from '@gorgias/axiom'

import css from './AuthenticationWarningBanner.less'

type Props = {
    onSelectCustomerClick: () => void
}

export const AuthenticationWarningBanner = ({
    onSelectCustomerClick,
}: Props) => {
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelectCustomerClick()
        }
    }

    return (
        <Banner
            variant="inline"
            intent="warning"
            icon="triangle-warning"
            isClosable={false}
            title="Authentication doesn't work in test mode."
            description={
                <div className={css.authWarningText}>
                    The AI Agent asked the customer to verify their identity,
                    but this can&apos;t be completed without a real customer.{' '}
                    <span
                        // oxlint-disable-next-line prefer-tag-over-role
                        role="button"
                        tabIndex={0}
                        className={css.selectCustomerLink}
                        onClick={onSelectCustomerClick}
                        onKeyDown={handleKeyDown}
                    >
                        Select a customer
                    </span>{' '}
                    in the test configuration to test order-related flows.
                </div>
            }
        />
    )
}
