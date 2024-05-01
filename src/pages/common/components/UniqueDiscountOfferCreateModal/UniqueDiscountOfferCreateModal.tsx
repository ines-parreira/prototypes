import React, {
    FormEvent,
    useCallback,
    useEffect,
    useState,
    useMemo,
} from 'react'
import {Map} from 'immutable'
import {
    FormGroup,
    InputGroup,
    Modal,
    ModalBody,
    ModalHeader,
    Form as ReactStrapForm,
} from 'reactstrap'
import {isEqual} from 'lodash'
import {AxiosError} from 'axios'
import {useAppNode} from 'appNode'
import {
    UniqueDiscountOffer,
    UniqueDiscountOfferCreatePayload,
    UniqueDiscountOfferTypeEnum,
} from 'models/convert/discountOffer/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import NumberInput from 'pages/common/forms/input/NumberInput'
import InputField from 'pages/common/forms/input/InputField'
import {useCreateDiscountOffer} from 'pages/convert/discountOffer/hooks/useCreateDiscountOffer'
import {useModalManager} from 'hooks/useModalManager'
import {UNIQUE_DISCOUNT_MODAL_NAME} from 'models/discountCodes/constants'
import {useUpdateDiscountOffer} from 'pages/convert/discountOffer/hooks/useUpdateDiscountOffer'
import Label from 'pages/common/forms/Label/Label'
import CustomerSegmentSelector from 'pages/convert/discountOffer/components/CustomerSegmentSelector/CustomerSegmentSelector'
import getShopifyMoneySymbol from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/helpers'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'
import css from './UniqueDiscountOfferCreateModal.less'
import {testIds, transformAxiosError} from './utils'

export type UniqueDiscountOfferCreateModalProps = {
    isOpen: boolean
    integration: Map<string, string>
    onClose: () => void
    onSubmit: (code: UniqueDiscountOffer) => void
}

export const UniqueDiscountOfferCreateModal: React.FC<UniqueDiscountOfferCreateModalProps> =
    (props) => {
        const {isOpen, integration, onClose, onSubmit} = props
        const initialDiscountState: UniqueDiscountOfferCreatePayload = useMemo(
            () => ({
                type: 'fixed',
                prefix: '',
                value: 0,
                minimum_purchase_amount: null,
                external_customer_segment_ids: null,
                store_integration_id: integration.get('id'),
            }),
            [integration]
        )
        const [discount, setDiscount] =
            useState<Partial<UniqueDiscountOfferCreatePayload>>(
                initialDiscountState
            )

        const [errors, setErrors] = useState<
            Partial<UniqueDiscountOfferCreatePayload>
        >({})

        const editDiscountOfferModal = useModalManager(
            UNIQUE_DISCOUNT_MODAL_NAME
        )
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

        const selectedSegment = useMemo(() => {
            return discount.external_customer_segment_ids &&
                discount.external_customer_segment_ids?.length > 0
                ? discount.external_customer_segment_ids[0]
                : null
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
                    {detail: Partial<UniqueDiscountOfferCreatePayload>[]},
                    unknown
                >
            )
            setErrors(transformed)
        }, [createDiscountOfferError, updateDiscountOfferError])

        // In edit mode, the payload comes from the modal params, so make sure to update the state
        useEffect(() => {
            if (editDiscountOfferParams?.id) {
                const {id: __id, ...restOfDiscount} = editDiscountOfferParams
                setDiscount(restOfDiscount)
                setMinRequirementsPurchase(
                    !!restOfDiscount.minimum_purchase_amount
                )
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [editDiscountOfferParams?.id])

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
                    store_integration_id:
                        discount.store_integration_id!.toString(),
                }

                if (!inEditMode) {
                    const offer = (await createDiscountOffer([
                        undefined,
                        discountPayload,
                    ])) as unknown as UniqueDiscountOffer

                    onSubmit(offer)
                } else {
                    if (!editDiscountOfferParams?.id) return

                    const updated = (await updateDiscountOffer([
                        undefined,
                        {discount_offer_id: editDiscountOfferParams.id},
                        discountPayload,
                    ])) as unknown as UniqueDiscountOffer

                    if (updated) {
                        onSubmit(updated)
                    }
                }
            },
            [
                createDiscountOffer,
                discount.external_customer_segment_ids,
                discount.minimum_purchase_amount,
                discount.prefix,
                discount.store_integration_id,
                discount.type,
                discount.value,
                editDiscountOfferParams?.id,
                inEditMode,
                onSubmit,
                updateDiscountOffer,
            ]
        )

        const isSaveButtonEnabled = useCallback(() => {
            if (!inEditMode) {
                return true
            }
            const {id: __id, ...restOfParamsDiscount} = editDiscountOfferParams

            return !isEqual(discount, restOfParamsDiscount)
        }, [discount, editDiscountOfferParams, inEditMode])

        const onCustomerSegmentChange = (segmentId: string | null) => {
            setDiscount((prevState) => ({
                ...prevState,
                external_customer_segment_ids:
                    segmentId === null ? null : [segmentId],
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
                <ModalHeader toggle={onClose} data-testid={testIds.header}>
                    <div>
                        <h2>
                            {inEditMode ? 'Edit' : 'Create a new'} discount
                            offer
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
                                data-testid={testIds.editAlert}
                                className={css.editAlert}
                                type={AlertType.Info}
                                icon
                            >
                                Changes will only be applied to the unique
                                discount codes that are generated{' '}
                                <strong>after</strong> saving. Existing discount
                                codes <strong>will not</strong> be affected.
                            </Alert>
                        )}
                        <FormGroup>
                            <InputField
                                isRequired
                                maxLength={10}
                                data-testid={testIds.prefixInput}
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
                                        value={discount.type}
                                        id={testIds.discountTypeSelect}
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
                                            data-testid={
                                                testIds.discountValueInput
                                            }
                                            name="discountType"
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
                                                    ? getShopifyMoneySymbol(
                                                          integration.get(
                                                              'currency'
                                                          )
                                                      )
                                                    : '%'
                                            }
                                        />
                                    </div>
                                )}
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label
                                className={css.label}
                                htmlFor="minimumPurchase"
                            >
                                Minimum purchase requirements
                            </Label>
                            <InputGroup
                                className={css.minPurchaseRequirementsWrapper}
                            >
                                <label className={css.purchaseRadio}>
                                    <input
                                        type="radio"
                                        data-testid={
                                            testIds.noMinRequirementsRadio
                                        }
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
                                            value={Number(
                                                discount.minimum_purchase_amount
                                            )}
                                            onChange={(value) =>
                                                setDiscount((discount) => ({
                                                    ...discount,
                                                    minimum_purchase_amount:
                                                        value,
                                                }))
                                            }
                                            min={0}
                                            prefix={getShopifyMoneySymbol(
                                                integration.get('currency')
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
                                        onChange={onCustomerSegmentChange}
                                    />
                                </div>
                            </InputGroup>
                        </FormGroup>
                    </ModalBody>
                    <ModalActionsFooter>
                        <span>
                            Unique discount codes generated from this offer will
                            be valid for 48 hours following the campaign
                            impression.
                        </span>
                        <Button
                            data-testid={testIds.backBtn}
                            intent="secondary"
                            className="mr-2"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            data-testid={testIds.saveBtn}
                            color="primary"
                            type="submit"
                            isDisabled={!isSaveButtonEnabled()}
                        >
                            {inEditMode ? 'Save Changes' : 'Save'}
                        </Button>
                    </ModalActionsFooter>
                </ReactStrapForm>
            </Modal>
        )
    }
