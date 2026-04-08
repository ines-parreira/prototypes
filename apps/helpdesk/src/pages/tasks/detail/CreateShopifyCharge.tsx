import type { FormEvent } from 'react'
import React, { useState } from 'react'

import client from '@repo/api-resources'
import type { AxiosError } from 'axios'
import classnames from 'classnames'

import { LegacyLabel as Label, toast } from '@gorgias/axiom'

import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import PageHeader from 'pages/common/components/PageHeader'
import InputField from 'pages/common/forms/input/InputField'
import NumberInput from 'pages/common/forms/input/NumberInput'
import cssSettings from 'pages/settings/settings.less'

const CreateShopifyCharge = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState<number>()
    const isFormValid =
        description.length > 0 && typeof amount !== 'undefined' && amount > 0

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setIsLoading(true)

        const data = {
            name: 'create_shopify_charge',
            params: {
                amount,
                description,
            },
        }

        try {
            await client.post('/api/integrations/shopify/tasks', data)

            toast.success('Shopify charge created succesfully.')
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
            <PageHeader title="Create Shopify charge" />
            <div
                className={classnames(
                    cssSettings.pageContainer,
                    cssSettings.contentWrapper,
                )}
            >
                <p>
                    Create a Shopify Usage charge for cases where the first
                    payment attempt failed. Examples:
                </p>
                <ul>
                    <li>
                        Charge an invoice when the initial payment failed due to
                        Shopify spending limit
                    </li>
                    <li>
                        Charge an invoice when the customer has issues with the
                        credit card saved in Shopify and our first attempt
                        failed
                    </li>
                </ul>
                <form onSubmit={onSubmit}>
                    <div>
                        <Label
                            htmlFor="shopify-charge-amount"
                            isRequired={true}
                        >
                            Amount ($)
                        </Label>
                        <NumberInput
                            value={amount}
                            onChange={setAmount}
                            hasControls={false}
                            step={0.01}
                            id="shopify-charge-amount"
                        />
                    </div>
                    <InputField
                        id="shopify-charge-description"
                        className={cssSettings.mb16}
                        label="Details"
                        value={description}
                        onChange={setDescription}
                        isRequired={true}
                    />
                    <div>
                        <p>Examples:</p>
                        <ul>
                            <li>
                                Starter/Basic/Pro/Advanced/Custom for the period
                                from 2023-11-10 to 2023-12-10
                            </li>
                            <li>
                                888 extra tickets for the period from 2023-10-20
                                to 2023-11-20
                            </li>
                        </ul>
                    </div>

                    <div>
                        <ConfirmButton
                            id="shopify-credit-button"
                            type="submit"
                            className={cssSettings.mt16}
                            confirmationContent={`A ${amount!} USD Shopify charge will be created. Are you sure?
                        `}
                            isLoading={isLoading}
                            isDisabled={!isFormValid}
                        >
                            Create charge
                        </ConfirmButton>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateShopifyCharge
