import type { FormEvent } from 'react'
import React, { useState } from 'react'

import client from '@repo/api-resources'
import type { AxiosError } from 'axios'
import classnames from 'classnames'

import { LegacyLabel as Label, toast } from '@gorgias/axiom'

import { ConfirmButton } from 'pages/common/components/button/ConfirmButton'
import { PageHeader } from 'pages/common/components/PageHeader'
import { DefaultExportInputField as InputField } from 'pages/common/forms/input/InputField'
import { DefaultExportNumberInput as NumberInput } from 'pages/common/forms/input/NumberInput'
import cssSettings from 'pages/settings/settings.less'

import css from './CreditShopifyBillingIntegration.less'

const CreditShopifyBillingIntegration = () => {
    const [creditAmount, setCreditAmount] = useState<number>()
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const isFormValid =
        typeof creditAmount !== 'undefined' &&
        creditAmount! > 0 &&
        !!description

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setIsLoading(true)

        const data = {
            name: 'credit_shopify_store_used_for_billing',
            params: {
                amount: creditAmount,
                description,
            },
        }

        try {
            await client.post('/api/integrations/shopify/tasks', data)

            toast.success('Amount successfully credited to Shopify account.')
        } catch (error) {
            const { response } = error as AxiosError<{ error: { msg?: any } }>

            if (response) {
                toast.error(response.data?.error?.msg)
            } else {
                throw error
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="full-width">
            <PageHeader title="Credit Shopify billing integration" />
            <div
                className={classnames(
                    cssSettings.pageContainer,
                    cssSettings.contentWrapper,
                )}
            >
                <form onSubmit={onSubmit}>
                    <InputField
                        id="shopify-credit-description"
                        className={cssSettings.mb16}
                        label="Description"
                        value={description}
                        onChange={setDescription}
                    />
                    <div className={css.creditAmount}>
                        <Label htmlFor="shopify-credit-amount">
                            Credit amount
                        </Label>
                        <NumberInput
                            value={creditAmount}
                            onChange={setCreditAmount}
                            hasControls={false}
                            step={0.01}
                            id="shopify-credit-amount"
                        />
                    </div>

                    <div>
                        <ConfirmButton
                            id="shopify-credit-button"
                            type="submit"
                            className={cssSettings.mt16}
                            confirmationContent={`
                        It is going to credit billing Shopify integration of this account with ${creditAmount!} for "${description}". Are you sure?
                        `}
                            isLoading={isLoading}
                            isDisabled={!isFormValid}
                        >
                            Add credit
                        </ConfirmButton>
                    </div>
                </form>
            </div>
        </div>
    )
}

export { CreditShopifyBillingIntegration }
