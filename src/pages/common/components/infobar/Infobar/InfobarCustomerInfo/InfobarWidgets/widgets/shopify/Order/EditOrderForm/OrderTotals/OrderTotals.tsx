import React from 'react'
import {FormGroup, FormText} from 'reactstrap'
import classnames from 'classnames'
import {Map} from 'immutable'

import MoneyAmount from '../../../../MoneyAmount'

import css from './OrderTotals.less'

type OwnProps = {
    currencyCode: string
    loading: boolean
    calculatedEditOrder: Map<any, any>
}

export function OrderTotals({
    loading,
    calculatedEditOrder,
    currencyCode,
}: OwnProps) {
    return (
        <dl className="row text-right mb-0">
            <dt className={classnames('col-7 mb-2', css.grey)}>Subtotal</dt>
            <dd
                className={classnames('col-5 mb-2', {
                    'text-muted': loading,
                })}
            >
                <MoneyAmount
                    renderIfZero
                    amount={calculatedEditOrder.get('total_line_items_price')}
                    currencyCode={currencyCode}
                />
            </dd>

            <dt className={classnames('col-7 mb-2', css.grey)}>Tax</dt>
            <dd
                className={classnames('col-5 mb-2', {
                    'text-muted': loading,
                })}
            >
                <MoneyAmount
                    amount={calculatedEditOrder.get('current_total_tax')}
                    currencyCode={currencyCode}
                />
            </dd>

            <dt className="col-7 mb-2">Total</dt>
            <dd className="col-5 mb-2">
                <strong className={classnames({'text-muted': loading})}>
                    <MoneyAmount
                        renderIfZero
                        amount={calculatedEditOrder.get('current_total_price')}
                        currencyCode={currencyCode}
                    />
                </strong>
            </dd>

            <dt className={classnames('col-7 mb-2', css.grey)}>
                Paid by customer
            </dt>
            <dd className="col-5 mb-2">
                <FormGroup check className="mb-3">
                    <MoneyAmount
                        renderIfZero
                        amount={calculatedEditOrder.get('paid_by_customer')}
                        currencyCode={currencyCode}
                    />

                    {!calculatedEditOrder.get('has_changes') ? (
                        <FormText color="muted">
                            No changes have been made
                        </FormText>
                    ) : (
                        <FormText color="muted">
                            Changes have been made
                        </FormText>
                    )}
                </FormGroup>
            </dd>
            {calculatedEditOrder.get('amount_to_collect') >= 0 ? (
                <dt className="col-7 mb-2">Amount to collect</dt>
            ) : (
                <dt className="col-7 mb-2">Amount to refund</dt>
            )}

            <dd className="col-5 mb-2">
                <FormGroup check className="mb-3">
                    <strong className={classnames({'text-muted': loading})}>
                        <MoneyAmount
                            renderIfZero
                            negative={
                                calculatedEditOrder.get('amount_to_collect') < 0
                            }
                            amount={calculatedEditOrder.get(
                                'amount_to_collect'
                            )}
                            currencyCode={currencyCode}
                        />
                    </strong>
                </FormGroup>
            </dd>
        </dl>
    )
}

export default OrderTotals
