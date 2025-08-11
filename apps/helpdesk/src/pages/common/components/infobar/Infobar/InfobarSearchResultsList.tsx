import classnames from 'classnames'
import { Card, CardBody, CardTitle } from 'reactstrap'

import { Badge } from '@gorgias/axiom'

import { Customer } from 'models/customer/types'
import { PickedCustomerWithHighlights } from 'models/search/types'
import css from 'pages/common/components/infobar/Infobar.less'
import { customerHighlightsTransform } from 'pages/common/components/Spotlight/helpers'
import { sanitizeHtmlDefault } from 'utils/html'

export const NO_CUSTOMER_FOUND_PLACEHOLDER = 'No customer found.'

type Props = {
    errorMessage: Maybe<string>
    searchResults: PickedCustomerWithHighlights[]
    defaultCustomerId: Maybe<number>
    onCustomerClick: (customerId: number, index: number) => Promise<void>
}

export const InfobarSearchResultsList = ({
    searchResults,
    defaultCustomerId,
    onCustomerClick,
    errorMessage,
}: Props) => {
    if (errorMessage) {
        return <p className="centered error">{errorMessage}</p>
    }

    if (searchResults.length === 0) {
        return <p className="centered">{NO_CUSTOMER_FOUND_PLACEHOLDER}</p>
    }

    const results: (Pick<Customer, 'id' | 'name' | 'email'> & {
        orderId?: string
    })[] = searchResults.map((item) => customerHighlightsTransform(item))

    return (
        <div className="m-3">
            <CardTitle className={css.cardTitle}>Customers found:</CardTitle>
            <div className="mt-3">
                {results.map((customer, idx) => {
                    const isDefaultCustomer = customer.id === defaultCustomerId
                    const className = classnames('clickable mb-2', {
                        'current-customer': isDefaultCustomer,
                    })

                    return (
                        <Card
                            className={className}
                            key={idx}
                            onClick={() => onCustomerClick(customer.id, idx)}
                        >
                            <CardBody>
                                {
                                    <>
                                        <span
                                            className={classnames(
                                                css.subtitle,
                                                'd-block mb-1 text-truncate',
                                            )}
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeHtmlDefault(
                                                    customer.name,
                                                ),
                                            }}
                                        />
                                        <span>
                                            {isDefaultCustomer && (
                                                <Badge
                                                    type="grey"
                                                    className="ml-2"
                                                >
                                                    Current Customer
                                                </Badge>
                                            )}
                                        </span>
                                    </>
                                }
                                {customer.email && (
                                    <div
                                        className={classnames(
                                            css.detail,
                                            'd-block text-truncate',
                                        )}
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHtmlDefault(
                                                customer.email,
                                            ),
                                        }}
                                    />
                                )}
                                {customer?.orderId && (
                                    <div
                                        className={classnames(
                                            css.detail,
                                            'd-block text-truncate',
                                        )}
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHtmlDefault(
                                                customer.orderId,
                                            ),
                                        }}
                                    />
                                )}
                            </CardBody>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
