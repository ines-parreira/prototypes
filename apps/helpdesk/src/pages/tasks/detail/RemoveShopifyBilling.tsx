import type { FormEvent } from 'react'
import React, { useState } from 'react'

import client from '@repo/api-resources'
import type { AxiosError } from 'axios'
import classnames from 'classnames'

import { toast } from '@gorgias/axiom'

import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import PageHeader from 'pages/common/components/PageHeader'
import cssSettings from 'pages/settings/settings.less'

const RemoveShopifyBilling = () => {
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setIsLoading(true)

        const data = {
            name: 'remove_shopify_billing',
            params: {},
        }

        try {
            await client.post('/api/integrations/shopify/tasks', data)

            toast.success('Shopify billing removed succesfully.')
        } catch (error) {
            const { response } = error as AxiosError<{ error: { msg?: any } }>

            if (response) {
                toast.error(response.data?.error?.msg)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="full-width">
            <PageHeader title="Remove Shopify Billing" />
            <div
                className={classnames(
                    cssSettings.pageContainer,
                    cssSettings.contentWrapper,
                )}
            >
                <p>
                    Remove Shopify Billing payment method from the customer so
                    that he can pay with a different payment method.
                </p>
                <form onSubmit={onSubmit}>
                    <div>
                        <ConfirmButton
                            id="remove-shopify-billing-button"
                            type="submit"
                            className={cssSettings.mt16}
                            confirmationContent={`Shopify Billing payment method will be removed. Are you sure?
                        `}
                            isLoading={isLoading}
                        >
                            Remove Shopify Billing
                        </ConfirmButton>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RemoveShopifyBilling
