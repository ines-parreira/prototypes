import type { FormEvent } from 'react'
import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { getMoneySymbol } from '@repo/utils'
import type { AxiosError } from 'axios'
import type { Map } from 'immutable'
import { isEqual } from 'lodash'
import {
    FormGroup,
    InputGroup,
    Modal,
    ModalBody,
    ModalHeader,
    Form as ReactStrapForm,
} from 'reactstrap'

import { LegacyButton as Button, LegacyLabel as Label } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import type {
    UniqueDiscountOffer,
    UniqueDiscountOfferCreatePayload,
    UniqueDiscountOfferTypeEnum,
} from 'models/convert/discountOffer/types'
import { UNIQUE_DISCOUNT_MODAL_NAME } from 'models/discountCodes/constants'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import InputField from 'pages/common/forms/input/InputField'
import NumberInput from 'pages/common/forms/input/NumberInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {
    AppliesTypeEnum,
    CollectionFormGroup,
} from 'pages/convert/discountOffer/components/CollectionFormGroup/CollectionFormGroup'
import CustomerSegmentSelector from 'pages/convert/discountOffer/components/CustomerSegmentSelector'
import { useCreateDiscountOffer } from 'pages/convert/discountOffer/hooks/useCreateDiscountOffer'
import { useUpdateDiscountOffer } from 'pages/convert/discountOffer/hooks/useUpdateDiscountOffer'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { transformAxiosError } from './utils'

import css from './UniqueDiscountOfferCreateModal.less'

export type UniqueDiscountOfferCreateModalProps = {
    isOpen: boolean
    integration: Map<string, string>
    onClose: () => void
    onSubmit: (inEditMode: boolean, code: UniqueDiscountOffer) => void
}

export const UniqueDiscountOfferCreateModal: React.FC<
    UniqueDiscountOfferCreateModalProps
> = (props) => {
    const { isOpen, integration, onClose, onSubmit } = props
    const { canAddUniqueDiscountOffer } = useToolbarContext()
    const initialDiscountState: UniqueDiscountOfferCreatePayload = useMemo(
        () => ({
            type: 'fixed',
            prefix: '',
            value: 0,
            minimum_purchase_amount: null,
            external_customer_segment_ids: null,
            external_collection_ids: null,
            external_product_ids: null,
            store_integration_id: integration.get('id'),
        }),
        [integration],
    )
    const [discount, setDiscount] =
        useState<Partial<UniqueDiscountOfferCreatePayload>>(
            initialDiscountState,
        )
    const [appliesTo, setAppliesTo] = useState<AppliesTypeEnum>(
        AppliesTypeEnum.ORDER_AMOUNT,
    )
    const currentAccount = useAppSelector(getCurrentAccountState)

    const [errors, setErrors] = useState<
        Partial<UniqueDiscountOfferCreatePayload>
    >({})

    const editDiscountOfferModal = useModalManager(UNIQUE_DISCOUNT_MODAL_NAME, {
        autoDestroy: false,
    })
    const editDiscountOfferParams =
        editDiscountOfferModal.getParams() as UniqueDiscountOffer

    const inEditMode = !!editDiscountOfferParams?.id

    const [minRequirementsPurchase, setMinRequirementsPurchase] =
        useState(false)

    useEffect(() => {
        // Reset the form when the modal is opened in create mode
        if (!inEditMode && isOpen) {
            setDiscount(initialDiscountState)
            setMinRequirementsPurchase(false)
        }
    }, [inEditMode, initialDiscountState, isOpen])

    const appNode = useAppNode()

    const selectedSegments = useMemo(() => {
        return new Set(discount.external_customer_segment_ids || [])
    }, [discount])

    const selectedCollections = useMemo(() => {
        return new Set(discount.external_collection_ids || [])
    }, [discount])

    const selectedProducts = useMemo(() => {
        return new Set(discount.external_product_ids || [])
    }, [discount])

    const {
        mutateAsync: createDiscountOffer,
        error: createDiscountOfferError,
    } = useCreateDiscountOffer()
    const {
        mutateAsync: updateDiscountOffer,
        error: updateDiscountOfferError,
    } = useUpdateDiscountOffer(editDiscountOfferParams?.prefix || '')

    useEffect(() => {
        // We do this annoying cast because in AxiosError, the `detail` field is a combination
        // of any and our rules don't allow accessing .something of any
        const transformed = transformAxiosError(
            (createDiscountOfferError ||
                updateDiscountOfferError) as unknown as AxiosError<
                { detail: Partial<UniqueDiscountOfferCreatePayload>[] },
                unknown
            >,
        )
        setErrors(transformed)
    }, [createDiscountOfferError, updateDiscountOfferError])

    // In edit mode, the payload comes from the modal params, so make sure to update the state
    useEffect(() => {
        if (editDiscountOfferParams?.id) {
            const { id: __id, ...restOfDiscount } = editDiscountOfferParams
            let appliesToType = AppliesTypeEnum.ORDER_AMOUNT
            if (restOfDiscount.external_collection_ids)
                appliesToType = AppliesTypeEnum.PRODUCT_COLLECTION
            else if (restOfDiscount.external_product_ids)
                appliesToType = AppliesTypeEnum.SPECIFIC_PRODUCT
            setDiscount(restOfDiscount)
            setAppliesTo(appliesToType)
            setMinRequirementsPurchase(!!restOfDiscount.minimum_purchase_amount)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editDiscountOfferParams?.id])

    useEffect(() => {
        if (appliesTo !== AppliesTypeEnum.PRODUCT_COLLECTION) {
            setDiscount((discount) => ({
                ...discount,
                external_collection_ids: null,
            }))
        }

        if (appliesTo !== AppliesTypeEnum.SPECIFIC_PRODUCT) {
            setDiscount((discount) => ({
                ...discount,
                external_product_ids: null,
            }))
        }
    }, [appliesTo])

    const handleSubmit = useCallback(
        async (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()
            evt.stopPropagation()

            const discountPayload: UniqueDiscountOfferCreatePayload = {
                type: discount.type!,
                prefix: discount.prefix!,
                value: discount.value,
                minimum_purchase_amount: discount.minimum_purchase_amount,
                external_customer_segment_ids:
                    discount.external_customer_segment_ids,
                external_collection_ids: discount.external_collection_ids,
                external_product_ids: discount.external_product_ids,
                store_integration_id: discount.store_integration_id!.toString(),
            }

            if (!inEditMode) {
                const offer = (
                    await createDiscountOffer([undefined, discountPayload])
                )?.data as UniqueDiscountOffer

                if (!offer) return

                logEvent(SegmentEvent.InsertUniqueDiscountCodeCreated, {
                    account_domain: currentAccount?.get('domain'),
                    discount: {
                        id: offer.id,
                        prefix: offer.prefix,
                    },
                })

                onSubmit(inEditMode, offer)
            } else {
                if (!editDiscountOfferParams?.id) return

                const offer = (
                    await updateDiscountOffer([
                        undefined,
                        { discount_offer_id: editDiscountOfferParams.id },
                        discountPayload,
                    ])
                )?.data as UniqueDiscountOffer

                if (offer) {
                    onSubmit(inEditMode, offer)
                }
            }
        },
        [
            createDiscountOffer,
            currentAccount,
            discount.external_customer_segment_ids,
            discount.external_collection_ids,
            discount.external_product_ids,
            discount.minimum_purchase_amount,
            discount.prefix,
            discount.store_integration_id,
            discount.type,
            discount.value,
            editDiscountOfferParams?.id,
            inEditMode,
            onSubmit,
            updateDiscountOffer,
        ],
    )

    const isSaveButtonEnabled = useCallback(() => {
        if (!inEditMode) {
            return true
        }
        const { id: __id, ...restOfParamsDiscount } = editDiscountOfferParams

        return !isEqual(discount, restOfParamsDiscount)
    }, [discount, editDiscountOfferParams, inEditMode])

    const onCustomerSegmentChange = (segmentId: string | null) => {
        let updatedSegments: Array<string> | null = null
        if (segmentId !== null) {
            if (selectedSegments.has(segmentId)) {
                selectedSegments.delete(segmentId)
            } else {
                selectedSegments.add(segmentId)
            }
            updatedSegments =
                selectedSegments.size > 0 ? Array.from(selectedSegments) : null
        }
        setDiscount((prevState) => ({
            ...prevState,
            external_customer_segment_ids: updatedSegments,
        }))
    }

    const onCollectionSelectionChange = (collectionId: string | null) => {
        let updatedCollections: Array<string> | null = null
        if (collectionId !== null) {
            if (selectedCollections.has(collectionId)) {
                selectedCollections.delete(collectionId)
            } else {
                selectedCollections.add(collectionId)
            }
            updatedCollections = Array.from(selectedCollections)
        }
        setDiscount((prevState) => ({
            ...prevState,
            external_collection_ids: updatedCollections,
        }))
    }

    const onSelectedProductsChange = (productId: string | null) => {
        let updatedProducts: Array<string> | null = null
        if (productId !== null) {
            if (selectedProducts.has(productId)) {
                selectedProducts.delete(productId)
            } else {
                selectedProducts.add(productId)
            }
            updatedProducts = Array.from(selectedProducts)
        }
        setDiscount((prevState) => ({
            ...prevState,
            external_product_ids: updatedProducts,
        }))
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={onClose}
            autoFocus
            backdrop="static"
            size="lg"
            // it has to be above popover which is currently set to 1560
            zIndex={1561}
            container={appNode ?? undefined}
        >
            <ModalHeader toggle={onClose}>
                <div>
                    <h2>
                        {inEditMode ? 'Edit' : 'Create a new'} discount offer
                    </h2>
                    <div className={css.headerSubtitle}>
                        Define the characteristics of the offer that will be
                        applied to the unique, one-time use discount codes
                        displayed in campaigns.{' '}
                        <a
                            href="https://link.gorgias.com/juh"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn more
                        </a>
                    </div>
                </div>
            </ModalHeader>
            <ReactStrapForm onSubmit={handleSubmit}>
                <ModalBody>
                    {inEditMode && (
                        <Alert
                            className={css.editAlert}
                            type={AlertType.Info}
                            icon
                        >
                            Changes will only be applied to the unique discount
                            codes that are generated <strong>after</strong>{' '}
                            saving. Existing discount codes{' '}
                            <strong>will not</strong> be affected.
                        </Alert>
                    )}
                    <FormGroup>
                        <InputField
                            isRequired
                            maxLength={10}
                            label="Unique code prefix"
                            value={discount.prefix}
                            error={errors?.prefix}
                            caption="Max 10 characters. Unique discount codes will be generated from this prefix, by adding six random numbers and letters at the end."
                            onChange={(prefix) =>
                                setDiscount((discount) => ({
                                    ...discount,
                                    prefix,
                                }))
                            }
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="discountType" className={css.label}>
                            Discount
                        </Label>
                        <InputGroup className={css.inputGroup}>
                            <div className={css.inputChild}>
                                <SelectField
                                    showSelectedOption
                                    fullWidth
                                    value={discount.type}
                                    id="discountType"
                                    options={[
                                        {
                                            label: 'Percentage',
                                            value: 'percentage',
                                        },
                                        {
                                            label: 'Fixed amount',
                                            value: 'fixed',
                                        },
                                        {
                                            label: 'Free shipping',
                                            value: 'free_shipping',
                                        },
                                    ]}
                                    onChange={(value) =>
                                        setDiscount((discount) => ({
                                            ...discount,
                                            type: value as UniqueDiscountOfferTypeEnum,
                                        }))
                                    }
                                />
                            </div>
                            {discount.type !== 'free_shipping' && (
                                <div className={css.inputChild}>
                                    <NumberInput
                                        id="discountValue"
                                        name="discountValue"
                                        aria-label="Discount value"
                                        value={Number(discount.value)}
                                        onChange={(value) =>
                                            setDiscount((discount) => ({
                                                ...discount,
                                                value,
                                            }))
                                        }
                                        hasError={!!errors?.value}
                                        hasControls={false}
                                        min={1}
                                        max={
                                            discount.type === 'fixed'
                                                ? undefined
                                                : 100
                                        }
                                        suffix={
                                            discount.type === 'fixed'
                                                ? getMoneySymbol(
                                                      integration.getIn([
                                                          'meta',
                                                          'currency',
                                                      ]),
                                                  )
                                                : '%'
                                        }
                                    />
                                </div>
                            )}
                        </InputGroup>
                    </FormGroup>
                    <CollectionFormGroup
                        integrationId={
                            integration.get('id') as unknown as number
                        }
                        selectedCollections={
                            discount.external_collection_ids || null
                        }
                        onSelectedCollectionsChange={
                            onCollectionSelectionChange
                        }
                        selectedProducts={discount.external_product_ids || null}
                        onSelectedProductsChange={onSelectedProductsChange}
                        appliesTo={appliesTo}
                        setAppliesTo={setAppliesTo}
                    />
                    <FormGroup>
                        <Label
                            className={css.label}
                            htmlFor="minimum-purchase-requirements"
                        >
                            Minimum purchase requirements
                        </Label>
                        <InputGroup
                            className={css.minPurchaseRequirementsWrapper}
                            id="minimum-purchase-requirements"
                        >
                            <label
                                htmlFor="no-minimum-requirements"
                                className={css.purchaseRadio}
                            >
                                <input
                                    type="radio"
                                    id="no-minimum-requirements"
                                    checked={!minRequirementsPurchase}
                                    onChange={() => {
                                        setMinRequirementsPurchase(false)
                                        setDiscount((discount) => ({
                                            ...discount,
                                            minimum_purchase_amount: null,
                                        }))
                                    }}
                                />
                                No minimum requirements
                            </label>
                            <div>
                                <label
                                    htmlFor="minimum-requirement"
                                    className={css.purchaseRadio}
                                >
                                    <input
                                        type="radio"
                                        id="minimum-requirement"
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
                                        id="minAmount"
                                        aria-label="Minimum purchase amount value"
                                        value={Number(
                                            discount.minimum_purchase_amount,
                                        )}
                                        onChange={(value) =>
                                            setDiscount((discount) => ({
                                                ...discount,
                                                minimum_purchase_amount: value,
                                            }))
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
                                    value={
                                        discount.external_customer_segment_ids ||
                                        null
                                    }
                                    integrationId={
                                        integration.get(
                                            'id',
                                        ) as unknown as number
                                    }
                                    onChange={onCustomerSegmentChange}
                                />
                            </div>
                        </InputGroup>
                    </FormGroup>
                </ModalBody>
                <ModalActionsFooter>
                    <span>
                        Unique discount codes generated from this offer will be
                        valid for 48 hours following the campaign impression.
                    </span>
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
                        isDisabled={!isSaveButtonEnabled()}
                    >
                        {inEditMode
                            ? 'Save Changes'
                            : canAddUniqueDiscountOffer
                              ? 'Save & Add'
                              : 'Save'}
                    </Button>
                </ModalActionsFooter>
            </ReactStrapForm>
        </Modal>
    )
}
