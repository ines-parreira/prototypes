import React, { ComponentProps } from 'react'

import classnames from 'classnames'

import { UpdatePaymentTerms as UpdatePaymentTermsInputType } from '@gorgias/api-queries'
import { SelectField, SelectFieldRawOption } from '@gorgias/merchant-ui-kit'

import { Form, FormField } from 'core/forms'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import { useGetPaymentTermsWithSideEffects } from 'pages/settings/new_billing/hooks/useGetPaymentTermsWithSideEffects'
import { useUpdatePaymentTermsWithSideEffects } from 'pages/settings/new_billing/hooks/useUpdatePaymentTermsWithSideEffects'
import cssSettings from 'pages/settings/settings.less'

type UpdatePaymentTermsFormInput = UpdatePaymentTermsInputType
const DEFAULT_PAYMENT_TERMS = 30
const ALLOWED_PAYMENT_TERMS = [30, 45, 60, 90]

type SelectInputProps<T extends SelectFieldRawOption = SelectFieldRawOption> =
    ComponentProps<typeof SelectField<T>>

type SelectInputFormFieldProps<
    T extends SelectFieldRawOption = SelectFieldRawOption,
> = {
    value: SelectInputProps<T>['selectedOption']
} & Omit<SelectInputProps<T>, 'selectedOption'>

const SelectInputFormField = <
    T extends SelectFieldRawOption = SelectFieldRawOption,
>({
    value,
    ...selectInputProps
}: SelectInputFormFieldProps<T>) => {
    return <SelectField {...selectInputProps} selectedOption={value} />
}

const UpdatePaymentTerms = () => {
    const paymentTermsQueryResult = useGetPaymentTermsWithSideEffects()

    const useUpdatePaymentTerms = useUpdatePaymentTermsWithSideEffects()

    const onSubmit = (data: UpdatePaymentTermsFormInput) => {
        useUpdatePaymentTerms.mutate({ data })
    }

    return (
        <div className="full-width">
            <PageHeader title="Update Payment Terms" />
            <div
                className={classnames(
                    cssSettings.pageContainer,
                    cssSettings.contentWrapper,
                )}
            >
                <p>
                    Update the payment terms for the customers for customer
                    using manual payment methods (e.g. ACH Credit, Wire transfer
                    etc.).
                </p>
                <p>
                    Payment terms are the amount of days after which the
                    invoices becomes past due.
                </p>
                <Form<UpdatePaymentTermsFormInput>
                    defaultValues={{
                        payment_terms:
                            paymentTermsQueryResult?.data?.data.payment_terms ||
                            DEFAULT_PAYMENT_TERMS,
                    }}
                    mode="onChange"
                    onValidSubmit={onSubmit}
                >
                    <FormField<
                        ComponentProps<
                            typeof SelectInputFormField<{ value: number }>
                        >
                    >
                        label="Payment Terms"
                        isRequired
                        name="payment_terms"
                        field={SelectInputFormField}
                        inputTransform={(value: number) => ({ value })}
                        outputTransform={(option) => option.value}
                        isDisabled={
                            paymentTermsQueryResult?.isLoading ||
                            useUpdatePaymentTerms.isLoading
                        }
                        options={ALLOWED_PAYMENT_TERMS.map((value) => ({
                            value,
                        }))}
                        optionMapper={(option) => ({
                            value: option.value.toString(),
                            subtext: `${option.value} days`,
                        })}
                    />

                    <div>
                        <Button
                            id="update-payment-terms-submit"
                            type="submit"
                            role="button"
                            intent="primary"
                            className={cssSettings.mt16}
                            isLoading={useUpdatePaymentTerms.isLoading}
                        >
                            Update
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default UpdatePaymentTerms
