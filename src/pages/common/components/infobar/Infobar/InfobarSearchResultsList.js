// @flow
import React from 'react'
import {type List, type Map} from 'immutable'
import classnames from 'classnames'
import {Card, CardBody, CardTitle, Badge} from 'reactstrap'

import {getDisplayName} from '../../../../../state/customers/helpers'

import css from '../Infobar.less'


type Props = {
    searchResults: List<*>,
    defaultCustomerId: ?number,
    onCustomerClick: (Map<*,*>) => Promise<void>
}

export default class InfobarSearchResultsList extends React.Component<Props> {
    render() {
        const {searchResults, defaultCustomerId, onCustomerClick} = this.props

        if (!searchResults.size) {
            return <p className="empty-items">No customer found.</p>
        }

        return (
            <div>
                <CardTitle className={css.cardTitle}>
                    Customers found:
                </CardTitle>
                <div className="mt-3">
                    {
                        searchResults.map((customer, idx) => {
                            const isDefaultCustomer = customer.get('id') === defaultCustomerId
                            const className = classnames('clickable mb-2', {
                                'current-customer': isDefaultCustomer
                            })

                            return (
                                <Card
                                    className={className}
                                    key={idx}
                                    onClick={() => onCustomerClick(customer)}
                                >
                                    <CardBody>
                                        {
                                            <span className={classnames(css.subtitle, 'd-block mb-1 text-truncate')}>
                                                {getDisplayName(customer)}
                                                {
                                                    isDefaultCustomer && (
                                                        <Badge
                                                            color="info"
                                                            className="ml-2"
                                                        >
                                                            Current Customer
                                                        </Badge>
                                                    )
                                                }
                                            </span>
                                        }
                                        {
                                            customer.get('email') && (
                                                <div className={classnames(css.detail, 'd-block text-truncate')}>
                                                    {customer.get('email')}
                                                </div>
                                            )
                                        }
                                    </CardBody>
                                </Card>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}
