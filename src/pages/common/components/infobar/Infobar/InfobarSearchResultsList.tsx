import React from 'react'
import {List, Map} from 'immutable'
import classnames from 'classnames'
import {Card, CardBody, CardTitle} from 'reactstrap'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {getDisplayName} from 'state/customers/helpers'

import css from '../Infobar.less'

type Props = {
    errorMessage: Maybe<string>
    searchResults: List<Map<any, any>>
    defaultCustomerId: Maybe<number>
    onCustomerClick: (map: Map<any, any>, index: number) => Promise<void>
}

export default class InfobarSearchResultsList extends React.Component<Props> {
    render() {
        const {
            searchResults,
            defaultCustomerId,
            onCustomerClick,
            errorMessage,
        } = this.props

        if (errorMessage) {
            return <p className="centered error">{errorMessage}</p>
        }

        if (!searchResults.size) {
            return <p className="centered">No customer found.</p>
        }

        return (
            <div className="m-3">
                <CardTitle className={css.cardTitle}>
                    Customers found:
                </CardTitle>
                <div className="mt-3">
                    {searchResults.map((customer, idx) => {
                        const isDefaultCustomer =
                            customer!.get('id') === defaultCustomerId
                        const className = classnames('clickable mb-2', {
                            'current-customer': isDefaultCustomer,
                        })

                        return (
                            <Card
                                className={className}
                                key={idx}
                                onClick={() => onCustomerClick(customer!, idx!)}
                            >
                                <CardBody>
                                    {
                                        <span
                                            className={classnames(
                                                css.subtitle,
                                                'd-block mb-1 text-truncate'
                                            )}
                                        >
                                            {getDisplayName(customer!)}
                                            {isDefaultCustomer && (
                                                <Badge
                                                    type={ColorType.Grey}
                                                    className="ml-2"
                                                >
                                                    Current Customer
                                                </Badge>
                                            )}
                                        </span>
                                    }
                                    {customer!.get('email') && (
                                        <div
                                            className={classnames(
                                                css.detail,
                                                'd-block text-truncate'
                                            )}
                                        >
                                            {customer!.get('email')}
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        )
                    })}
                </div>
            </div>
        )
    }
}
