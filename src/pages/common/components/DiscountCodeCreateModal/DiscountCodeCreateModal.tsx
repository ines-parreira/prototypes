import React, {ChangeEvent, FormEvent, memo, useCallback, useState} from 'react'
import {
    Form as ReactStrapForm,
    FormGroup,
    FormText,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    ModalBody,
    ModalHeader,
} from 'reactstrap'
import moment from 'moment-timezone'
import axios, {AxiosError} from 'axios'
import {Map} from 'immutable'

import {DISCOUNT_TYPE, DISCOUNT_CHOICES} from 'models/discountCodes/constants'
import {OnSubmitButton} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import Button from 'pages/common/components/button/Button'
import Errors from 'pages/common/forms/Errors'
import CheckBox from 'pages/common/forms/CheckBox'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import client from 'models/api/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import {PreviewRadioButton} from '../PreviewRadioButton'

type Props = {
    integration: Map<string, string>
    onSubmit: OnSubmitButton
    onClose: () => void
}

function DiscountCodeCreateModal({onSubmit, onClose, integration}: Props) {
    const [discountType, setDiscountType] = useState(DISCOUNT_TYPE.PERCENTAGE)
    const [discountCode, setDiscountCode] = useState<string>()
    const [discountValue, setDiscountValue] = useState<number>(0)
    const [isOneTime, setIsOneTime] = useState(true)

    const [formErrors, setFormErrors] = useState({
        code: null,
    })

    const dispatch = useAppDispatch()

    const handleSubmit = useCallback(
        (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()

            const data = {
                starts_at: moment(),
                discount_type: discountType,
                title: null,
                code: discountCode,
                discount_value: discountValue,
                once_per_customer: isOneTime,
                usage_limit: isOneTime ? 1 : null,
            }

            client
                .post(`/api/discount-codes/${integration.get('id')}/`, data)
                .then(function (response) {
                    onSubmit(response.data)
                })
                .catch(function (error: AxiosError<{error?: {data?: any}}>) {
                    if (axios.isAxiosError(error)) {
                        setFormErrors(error.response?.data?.error?.data)
                    }

                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: "Couldn't add discount code",
                        })
                    )
                })
        },
        [
            discountCode,
            discountType,
            discountValue,
            dispatch,
            integration,
            isOneTime,
            onSubmit,
        ]
    )

    const handleGenerate = () => {
        const prefix = integration
            .get('name')
            .replace(' ', '')
            .substring(0, 5)
            .toUpperCase()

        // generate random string
        setDiscountCode(
            prefix +
                Math.random()
                    .toString(36)
                    .slice(2, 10 - prefix.length)
                    .toUpperCase()
        )
    }

    const handleChangeDiscountValue = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.valueAsNumber
        if (value) {
            setDiscountValue(value / 100)
        }
    }

    const handleChangeDiscountType = (value: string) => {
        setDiscountType(value)
        setDiscountValue(0)
    }

    return (
        <>
            <ModalHeader toggle={onClose}>Create discount code</ModalHeader>
            <ReactStrapForm onSubmit={handleSubmit}>
                <ModalBody>
                    <FormGroup>
                        <Label for="title">Select discount type</Label>
                        <div style={{display: 'flex', gap: '20px'}}>
                            {DISCOUNT_CHOICES.map((item, index) => (
                                <PreviewRadioButton
                                    label={item.label}
                                    key={index}
                                    onClick={() =>
                                        handleChangeDiscountType(item.value)
                                    }
                                    isSelected={discountType === item.value}
                                    value={item.value}
                                />
                            ))}
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Label for="code">Discount code</Label>
                        <InputGroup>
                            <Input
                                value={discountCode}
                                name="code"
                                onChange={(event) =>
                                    setDiscountCode(event.target.value)
                                }
                                required={true}
                                invalid={!!formErrors?.code}
                            />
                            <Button onClick={handleGenerate} className="ml-3">
                                Generate
                            </Button>
                            <Errors>{formErrors?.code}</Errors>
                        </InputGroup>
                    </FormGroup>
                    {discountType === DISCOUNT_TYPE.PERCENTAGE && (
                        <FormGroup>
                            <Label for="discount_value">Percentage value</Label>
                            <InputGroup>
                                <Input
                                    name="discount_value"
                                    value={discountValue && discountValue * 100}
                                    onChange={handleChangeDiscountValue}
                                    type="number"
                                    min={1}
                                    max={100}
                                    step={0.01}
                                    required={true}
                                />
                                <InputGroupText>%</InputGroupText>
                            </InputGroup>
                            <FormText color="muted">
                                The percentage value of the discount.
                            </FormText>
                        </FormGroup>
                    )}
                    {discountType === DISCOUNT_TYPE.FIXED && (
                        <FormGroup>
                            <Label for="discount_value">Fixed amount</Label>
                            <InputGroup>
                                <InputGroupText>
                                    {integration.get('currency')}
                                </InputGroupText>
                                <Input
                                    name="discount_value"
                                    value={discountValue}
                                    onChange={(event) =>
                                        setDiscountValue(
                                            event.target.valueAsNumber
                                        )
                                    }
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    required={true}
                                />
                            </InputGroup>
                            <FormText color="muted">
                                Customers must enter this code at checkout.
                            </FormText>
                        </FormGroup>
                    )}
                    <FormGroup>
                        <CheckBox
                            className="mb-3"
                            isChecked={isOneTime}
                            onChange={setIsOneTime}
                        >
                            One-time use
                        </CheckBox>
                    </FormGroup>
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        intent="secondary"
                        className="mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button color="primary" type="submit">
                        Save
                    </Button>
                </ModalActionsFooter>
            </ReactStrapForm>
        </>
    )
}

export default memo(DiscountCodeCreateModal)
