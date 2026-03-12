import type { FormEvent } from 'react'
import React, { memo, useCallback, useEffect, useState } from 'react'

import { getMoneySymbol } from '@repo/utils'
import type { AxiosError } from 'axios'
import { isAxiosError } from 'axios'
import type { Map } from 'immutable'
import moment from 'moment-timezone'
import {
    FormGroup,
    Input,
    InputGroup,
    ModalBody,
    ModalHeader,
    Form as ReactStrapForm,
} from 'reactstrap'

import { LegacyButton as Button, LegacyLabel as Label } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import client from 'models/api/resources'
import {
    DISCOUNT_CHOICES,
    DISCOUNT_TYPE,
    DISCOUNT_USE_CHOICES,
    DISCOUNT_USE_TYPE,
} from 'models/discountCodes/constants'
import type { DiscountCode } from 'models/discountCodes/types'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Errors from 'pages/common/forms/Errors'
import NumberInput from 'pages/common/forms/input/NumberInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {
    AppliesTypeEnum,
    CollectionFormGroup,
} from 'pages/convert/discountOffer/components/CollectionFormGroup/CollectionFormGroup'
import CustomerSegmentSelector from 'pages/convert/discountOffer/components/CustomerSegmentSelector'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getTicketState } from 'state/ticket/selectors'

import css from './DiscountCodeCreateModal.less'

type Props = {
    integration: Map<string, string>
    onSubmit: (data: DiscountCode) => void
    onClose: () => void
}

function DiscountCodeCreateModal({ onSubmit, onClose, integration }: Props) {
    const ticket = useAppSelector(getTicketState)

    const [discountType, setDiscountType] = useState(DISCOUNT_TYPE.PERCENTAGE)
    const [discountCode, setDiscountCode] = useState<string>()
    const [discountValue, setDiscountValue] = useState<number>(0)
    const [selectedSegments, setSelectedSegments] = useState<string[] | null>(
        null,
    )
    const [selectedCollections, setSelectedCollections] = useState<string[]>([])
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [appliesTo, setAppliesTo] = useState<AppliesTypeEnum>(
        AppliesTypeEnum.ORDER_AMOUNT,
    )
    const [discountUseType, setDiscountUseType] = useState(
        ticket?.get('id')
            ? DISCOUNT_USE_TYPE.ONE_PER_USER
            : DISCOUNT_USE_TYPE.NO_LIMIT,
    )
    const [minRequirementsPurchase, setMinRequirementsPurchase] =
        useState(false)
    const [minRequirementsPurchaseAmount, setMinRequirementsPurchaseAmount] =
        useState<number>(0)

    const [formErrors, setFormErrors] = useState({
        code: null,
    })
    const shouldRenderProductAndCollectionFormGroup =
        discountType !== DISCOUNT_TYPE.FREE_SHIPPING

    const dispatch = useAppDispatch()

    const handleSegmentValueChange = (value: string | null): void => {
        const selectedSegmentsSet = new Set(selectedSegments)
        if (value !== null)
            selectedSegmentsSet.has(value)
                ? selectedSegmentsSet.delete(value)
                : selectedSegmentsSet.add(value)
        setSelectedSegments(
            value && selectedSegmentsSet.size > 0
                ? Array.from(selectedSegmentsSet)
                : null,
        )
    }

    const handleCollectionChange = useCallback(
        (value: string | null): void => {
            const selectedCollectionsSet = new Set(selectedCollections)
            if (value !== null)
                selectedCollectionsSet.has(value)
                    ? selectedCollectionsSet.delete(value)
                    : selectedCollectionsSet.add(value)
            setSelectedCollections(Array.from(selectedCollectionsSet))
        },
        [selectedCollections],
    )

    const handleSelectedProductsChange = useCallback(
        (value: string | null): void => {
            const selectedProductsSet = new Set(selectedProducts)
            if (value !== null)
                selectedProductsSet.has(value)
                    ? selectedProductsSet.delete(value)
                    : selectedProductsSet.add(value)
            setSelectedProducts(Array.from(selectedProductsSet))
        },
        [selectedProducts],
    )

    // Listen to applies to and clear the selection if it's not going to be used
    useEffect(() => {
        if (appliesTo !== AppliesTypeEnum.PRODUCT_COLLECTION) {
            setSelectedCollections([])
        }

        if (appliesTo !== AppliesTypeEnum.SPECIFIC_PRODUCT) {
            setSelectedProducts([])
        }
    }, [appliesTo])

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
                segment_ids: selectedSegments,
                product_ids:
                    shouldRenderProductAndCollectionFormGroup &&
                    selectedProducts.length
                        ? selectedProducts
                        : null,
                collection_ids:
                    shouldRenderProductAndCollectionFormGroup &&
                    selectedCollections.length
                        ? selectedCollections
                        : null,
            }

            client
                .post(`/api/discount-codes/${integration.get('id')}/`, data)
                .then(function (response) {
                    onSubmit(response.data)
                })
                .catch(function (
                    error: AxiosError<{ error?: { data?: any } }>,
                ) {
                    if (isAxiosError(error)) {
                        setFormErrors(error.response?.data?.error?.data)
                    }

                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: "Couldn't add discount code",
                        }),
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
            selectedSegments,
            selectedProducts,
            selectedCollections,
            shouldRenderProductAndCollectionFormGroup,
            integration,
            onSubmit,
            dispatch,
        ],
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
                    .toUpperCase(),
        )
    }

    return (
        <>
            <ModalHeader toggle={onClose}>Create discount code</ModalHeader>
            <ReactStrapForm onSubmit={handleSubmit}>
                <ModalBody>
                    <FormGroup>
                        <Label htmlFor="discountValue" className={css.label}>
                            Discount
                        </Label>
                        <InputGroup className={css.inputGroup}>
                            <div className={css.inputChild}>
                                <SelectField
                                    showSelectedOption
                                    fullWidth
                                    value={discountType}
                                    aria-label="Discount type"
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
                                        id="discountValue"
                                        name="discountValue"
                                        value={Number(discountValue)}
                                        onChange={(value) =>
                                            setDiscountValue(value ?? 0)
                                        }
                                        hasControls={false}
                                        min={1}
                                        step={0.01}
                                        suffix={getMoneySymbol(
                                            integration.getIn([
                                                'meta',
                                                'currency',
                                            ]),
                                        )}
                                    />
                                </div>
                            )}
                            {discountType === DISCOUNT_TYPE.PERCENTAGE && (
                                <div className={css.inputChild}>
                                    <NumberInput
                                        id="discountValue"
                                        name="discountValue"
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
                                id="code"
                                name="code"
                                onChange={(event) =>
                                    setDiscountCode(event.target.value)
                                }
                                required={true}
                                invalid={!!formErrors?.code}
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
                        <Label
                            className={css.label}
                            htmlFor="minimum-purchase-requirement"
                        >
                            Minimum purchase requirements
                        </Label>
                        <InputGroup
                            id="minimum-purchase-requirement"
                            className={css.options}
                        >
                            <label
                                htmlFor="no-minimum-requirement"
                                className={css.purchaseRadio}
                            >
                                <input
                                    type="radio"
                                    id="no-minimum-requirement"
                                    checked={!minRequirementsPurchase}
                                    onChange={() => {
                                        setMinRequirementsPurchase(false)
                                        setMinRequirementsPurchaseAmount(0)
                                    }}
                                />
                                No minimum requirements
                            </label>
                            <div>
                                <label
                                    htmlFor="minimum-purchase-required"
                                    className={css.purchaseRadio}
                                >
                                    <input
                                        type="radio"
                                        id="minimum-purchase-required"
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
                                        aria-label="Minimum purchase amount value"
                                        value={minRequirementsPurchaseAmount}
                                        onChange={(value) =>
                                            setMinRequirementsPurchaseAmount(
                                                value ?? 0,
                                            )
                                        }
                                        min={0}
                                        prefix={getMoneySymbol(
                                            integration.getIn([
                                                'meta',
                                                'currency',
                                            ]),
                                        )}
                                    />
                                )}
                            </div>
                        </InputGroup>
                    </FormGroup>
                    {shouldRenderProductAndCollectionFormGroup && (
                        <CollectionFormGroup
                            integrationId={
                                integration.get('id') as unknown as number
                            }
                            selectedCollections={selectedCollections}
                            onSelectedCollectionsChange={handleCollectionChange}
                            selectedProducts={selectedProducts}
                            onSelectedProductsChange={
                                handleSelectedProductsChange
                            }
                            appliesTo={appliesTo}
                            setAppliesTo={setAppliesTo}
                        />
                    )}
                    <FormGroup>
                        <Label
                            className={css.label}
                            htmlFor="customer-eligibility"
                        >
                            Customer eligibility
                        </Label>
                        <InputGroup className={css.inputGroup}>
                            <div className={css.customerSegmentWrapper}>
                                <CustomerSegmentSelector
                                    id="customer-eligibility"
                                    value={selectedSegments}
                                    integrationId={
                                        integration.get(
                                            'id',
                                        ) as unknown as number
                                    }
                                    onChange={handleSegmentValueChange}
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
                    <Button color="primary" type="submit">
                        Save
                    </Button>
                </ModalActionsFooter>
            </ReactStrapForm>
        </>
    )
}

export default memo(DiscountCodeCreateModal)
