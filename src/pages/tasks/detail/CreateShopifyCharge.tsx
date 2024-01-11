import React, {FormEvent, useState} from 'react'
import classnames from 'classnames'
import {AxiosError} from 'axios'
import useAppDispatch from 'hooks/useAppDispatch'
import PageHeader from 'pages/common/components/PageHeader'
import cssSettings from 'pages/settings/settings.less'
import {notify} from 'state/notifications/actions'
import client from 'models/api/resources'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import InputField from 'pages/common/forms/input/InputField'
import {Notification, NotificationStatus} from 'state/notifications/types'

const CreateShopifyCharge = () => {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const isFormValid = [description, amount].every((v) => v.length > 0)

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

            const notification: Notification = {
                status: NotificationStatus.Success,
                message: 'Shopify charge created succesfully.',
            }

            void dispatch(notify(notification))
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg?: any}}>

            if (response) {
                const notification: Notification = {
                    status: NotificationStatus.Error,
                    message: response.data?.error?.msg,
                }

                void dispatch(notify(notification))
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
                    cssSettings.contentWrapper
                )}
            >
                <form onSubmit={onSubmit}>
                    <InputField
                        id="shopify-charge-amount"
                        className={cssSettings.mb16}
                        label="Amount"
                        value={amount}
                        onChange={setAmount}
                        isRequired={true}
                    />
                    <InputField
                        id="shopify-charge-description"
                        className={cssSettings.mb16}
                        label="Description"
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
                            confirmationContent={`A ${amount} USD Shopify charge will be created. Are you sure?
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
