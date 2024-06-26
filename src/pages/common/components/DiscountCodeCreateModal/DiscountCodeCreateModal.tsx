import React, {FormEvent, memo, useCallback, useState} from 'react'
import {
    Form as ReactStrapForm,
    FormGroup,
    Input,
    InputGroup,
    ModalBody,
    ModalHeader,
} from 'reactstrap'
import moment from 'moment-timezone'
import axios, {AxiosError} from 'axios'
import {Map} from 'immutable'
import {Label} from '@gorgias/ui-kit'

import {
    DISCOUNT_TYPE,
    DISCOUNT_CHOICES,
    DISCOUNT_USE_TYPE,
    DISCOUNT_USE_CHOICES,
} from 'models/discountCodes/constants'

import Button from 'pages/common/components/button/Button'
import Errors from 'pages/common/forms/Errors'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import client from 'models/api/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import {DiscountCode} from 'models/discountCodes/types'
import NumberInput from 'pages/common/forms/input/NumberInput'
import CustomerSegmentSelector from 'pages/convert/discountOffer/components/CustomerSegmentSelector'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import useAppSelector from 'hooks/useAppSelector'
import {getTicketState} from 'state/ticket/selectors'
import getShopifyMoneySymbol from '../infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/helpers'
import {testIds} from './utils'
import css from './DiscountCodeCreateModal.less'

type Props = {
    integration: Map<string, string>
    onSubmit: (data: DiscountCode) => void
    onClose: () => void
}

function DiscountCodeCreateModal({onSubmit, onClose, integration}: Props) {
    const ticket = useAppSelector(getTicketState)

    const [discountType, setDiscountType] = useState(DISCOUNT_TYPE.PERCENTAGE)
    const [discountCode, setDiscountCode] = useState<string>()
    const [discountValue, setDiscountValue] = useState<number>(0)
    const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
    const [discountUseType, setDiscountUseType] = useState(
        ticket?.get('id')
            ? DISCOUNT_USE_TYPE.ONE_PER_USER
            : DISCOUNT_USE_TYPE.NO_LIMIT
    )
    const [minRequirementsPurchase, setMinRequirementsPurchase] =
        useState(false)
    const [minRequirementsPurchaseAmount, setMinRequirementsPurchaseAmount] =
        useState<number>(0)

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
                once_per_customer:
                    discountUseType !== DISCOUNT_USE_TYPE.NO_LIMIT,
                usage_limit:
                    discountUseType === DISCOUNT_USE_TYPE.ONE_USE ? 1 : null,
                minimum_purchase_amount: minRequirementsPurchase
                    ? minRequirementsPurchaseAmount
                    : null,
                segment_ids: selectedSegment ? [selectedSegment] : [],
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
            discountType,
            discountCode,
            discountValue,
            discountUseType,
            minRequirementsPurchase,
            minRequirementsPurchaseAmount,
            selectedSegment,
            integration,
            onSubmit,
            dispatch,
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

    return (
        <>
            <ModalHeader toggle={onClose}>Create discount code</ModalHeader>
            <ReactStrapForm onSubmit={handleSubmit}>
                <ModalBody>
                    <FormGroup>
                        <Label htmlFor="discountType" className={css.label}>
                            Discount
                        </Label>
                        <InputGroup className={css.inputGroup}>
                            <div className={css.inputChild}>
                                <SelectField
                                    showSelectedOption
                                    fullWidth
                                    value={discountType}
                                    id={testIds.discountTypeSelect}
                                    options={DISCOUNT_CHOICES}
                                    onChange={(value) => {
                                        setDiscountType(value as string)
                                        setDiscountValue(0)
                                    }}
                                />
                            </div>
                            {discountType === DISCOUNT_TYPE.FIXED && (
                                <div className={css.inputChild}>
                                    <NumberInput
                                        data-testid={testIds.discountValueInput}
                                        name="discountType"
                                        value={Number(discountValue)}
                                        onChange={(value) =>
                                            setDiscountValue(value ?? 0)
                                        }
                                        hasControls={false}
                                        min={1}
                                        step={0.01}
                                        suffix={getShopifyMoneySymbol(
                                            integration.getIn([
                                                'meta',
                                                'currency',
                                            ])
                                        )}
                                    />
                                </div>
                            )}
                            {discountType === DISCOUNT_TYPE.PERCENTAGE && (
                                <div className={css.inputChild}>
                                    <NumberInput
                                        data-testid={testIds.discountValueInput}
                                        name="discountType"
                                        value={Number(discountValue * 100)}
                                        onChange={(value) =>
                                            setDiscountValue((value ?? 0) / 100)
                                        }
                                        hasControls={false}
                                        min={1}
                                        max={100}
                                        step={0.01}
                                        suffix={'%'}
                                    />
                                </div>
                            )}
                        </InputGroup>
                    </FormGroup>
                    <FormGroup>
                        <Label className={css.label} htmlFor="code">
                            Discount code
                        </Label>
                        <InputGroup>
                            <Input
                                value={discountCode}
                                name="code"
                                onChange={(event) =>
                                    setDiscountCode(event.target.value)
                                }
                                required={true}
                                invalid={!!formErrors?.code}
                                data-testid={testIds.codeInput}
                            />
                            <Button
                                onClick={handleGenerate}
                                className="ml-3"
                                intent="secondary"
                            >
                                Generate
                            </Button>
                            <Errors>{formErrors?.code}</Errors>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup>
                        <Label className={css.label} htmlFor="minimumPurchase">
                            Minimum purchase requirements
                        </Label>
                        <InputGroup className={css.options}>
                            <label className={css.purchaseRadio}>
                                <input
                                    type="radio"
                                    data-testid={testIds.noMinRequirementsRadio}
                                    checked={!minRequirementsPurchase}
                                    onChange={() => {
                                        setMinRequirementsPurchase(false)
                                        setMinRequirementsPurchaseAmount(0)
                                    }}
                                />
                                No minimum requirements
                            </label>
                            <div>
                                <label className={css.purchaseRadio}>
                                    <input
                                        type="radio"
                                        data-testid={
                                            testIds.minRequirementsRadio
                                        }
                                        className={css.radioButton}
                                        checked={minRequirementsPurchase}
                                        onChange={() =>
                                            setMinRequirementsPurchase(true)
                                        }
                                    />
                                    Minimum purchase amount
                                </label>
                                {minRequirementsPurchase && (
                                    <NumberInput
                                        name="minAmount"
                                        data-testid={
                                            testIds.minPurchaseAmountInput
                                        }
                                        value={minRequirementsPurchaseAmount}
                                        onChange={(value) =>
                                            setMinRequirementsPurchaseAmount(
                                                value ?? 0
                                            )
                                        }
                                        min={0}
                                        prefix={getShopifyMoneySymbol(
                                            integration.getIn([
                                                'meta',
                                                'currency',
                                            ])
                                        )}
                                    />
                                )}
                            </div>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup>
                        <Label
                            className={css.label}
                            htmlFor="customerEligibility"
                        >
                            Customer eligibility
                        </Label>
                        <InputGroup className={css.inputGroup}>
                            <div className={css.customerSegmentWrapper}>
                                <CustomerSegmentSelector
                                    value={selectedSegment}
                                    integrationId={
                                        integration.get(
                                            'id'
                                        ) as unknown as number
                                    }
                                    onChange={(value) =>
                                        setSelectedSegment(value)
                                    }
                                />
                            </div>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup>
                        <Label className={css.label} htmlFor="minimumUses">
                            Maximum discount uses
                        </Label>
                        <InputGroup className={css.options}>
                            {DISCOUNT_USE_CHOICES.map((item) => (
                                <label
                                    className={css.purchaseRadio}
                                    key={item.value}
                                >
                                    <input
                                        type="radio"
                                        checked={discountUseType === item.value}
                                        onChange={() => {
                                            setDiscountUseType(item.value)
                                        }}
                                    />
                                    {item.label}
                                </label>
                            ))}
                        </InputGroup>
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
                    <Button
                        color="primary"
                        type="submit"
                        data-testid={testIds.saveBtn}
                    >
                        Save
                    </Button>
                </ModalActionsFooter>
            </ReactStrapForm>
        </>
    )
}

export default memo(DiscountCodeCreateModal)
