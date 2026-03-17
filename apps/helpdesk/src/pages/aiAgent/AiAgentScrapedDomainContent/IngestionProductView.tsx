import React, { useState } from 'react'

import _capitalize from 'lodash/capitalize'

import { ExecutionIdDisplay } from 'pages/aiAgent/components/ExecutionIdDisplay/ExecutionIdDisplay'
import ControlledCollapsibleDetails from 'pages/tickets/detail/components/TicketVoiceCall/ControlledCollapsibleDetails'

import type { IngestedProduct } from './types'

import css from './IngestionProductView.less'

type Props = {
    product: IngestedProduct
}

const IngestionProductView = ({ product }: Props) => {
    const [isWebPagesOpen, setIsWebPagesOpen] = useState(false)

    if (!product) {
        return null
    }

    return (
        <div className={css.productDetails}>
            <div className={css.productField}>
                <span className="body-semibold">Title:</span>{' '}
                {product.product_name}
            </div>
            <div className={css.productField}>
                <span className="body-semibold">Product ID:</span>{' '}
                {product.product_id}
            </div>
            <div className={css.productField}>
                <span className="body-semibold">Description</span>
                <div
                    className={css.description}
                    dangerouslySetInnerHTML={{
                        __html: product.description,
                    }}
                />
            </div>
            {product.metadata && product.metadata.length > 0 && (
                <div className={css.productField}>
                    <span className="body-semibold">Details</span>
                    <div className={css.description}>
                        {product.metadata.map((item, index) => (
                            <div key={index}>
                                {_capitalize(item.question)}: {item.response}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {product.shipping_policy && (
                <div className={css.productField}>
                    <span className="body-semibold">Shipping info</span>
                    <div
                        className={css.description}
                        dangerouslySetInnerHTML={{
                            __html: product.shipping_policy,
                        }}
                    />
                </div>
            )}
            {product.sizing && (
                <div className={css.productField}>
                    <span className="body-semibold">Sizing info</span>
                    <div
                        className={css.description}
                        dangerouslySetInnerHTML={{
                            __html: product.sizing,
                        }}
                    />
                </div>
            )}
            {product.return_policy && (
                <div className={css.productField}>
                    <span className="body-semibold">Return policy</span>
                    <div
                        className={css.description}
                        dangerouslySetInnerHTML={{
                            __html: product.return_policy,
                        }}
                    />
                </div>
            )}
            {product.web_pages && product.web_pages.length > 0 && (
                <div className="mt-4">
                    <ControlledCollapsibleDetails
                        isOpen={isWebPagesOpen}
                        setIsOpen={setIsWebPagesOpen}
                        title={
                            <div className={css.collapsibleWebPagesTitle}>
                                View Source URLs
                            </div>
                        }
                    >
                        <div className={css.webPagesList}>
                            {product.web_pages.map(
                                (web_page: any, index: number) => (
                                    <a
                                        key={index}
                                        href={web_page.url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {web_page.url}
                                    </a>
                                ),
                            )}
                        </div>
                    </ControlledCollapsibleDetails>
                </div>
            )}
            <ExecutionIdDisplay executionId={product.execution_id} />
        </div>
    )
}

export default IngestionProductView
