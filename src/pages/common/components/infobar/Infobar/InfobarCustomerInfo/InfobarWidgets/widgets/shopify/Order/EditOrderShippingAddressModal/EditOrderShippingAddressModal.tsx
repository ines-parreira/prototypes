import React, {
    MouseEvent,
    useCallback,
    useMemo,
    useState,
    FormEvent,
} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import PropTypes from 'prop-types'
import {useUpdateEffect, usePrevious} from 'react-use'
import {
    Button,
    Form,
    ModalFooter,
    ButtonDropdown,
    DropdownToggle,
    DropdownItem,
    DropdownMenu,
    FormGroup,
    Label,
} from 'reactstrap'

import classnames from 'classnames'

import {states} from '../../../../../../../../../../../fixtures/states'

import {RootState} from '../../../../../../../../../../../state/types'
import {InfobarModalProps} from '../../../types'
import Modal from '../../../../../../../../Modal'
import {ShopifyActionType} from '../../types'

import InputField from '../../../../../../../../../forms/InputField'

import {getShippingAddressState} from '../../../../../../../../../../../state/infobarActions/shopify/editShippingAddress/selectors'

import {
    onInit,
    onReset,
} from '../../../../../../../../../../../state/infobarActions/shopify/editShippingAddress/action'

import shortcutManager from '../../../../../../../../../../../services/shortcutManager/shortcutManager'
import {getIntegrationsByTypes} from '../../../../../../../../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../../../../../../../../models/integration/types'

import SelectField from '../../../../../../../../../forms/SelectField/SelectField'

import Loader from '../../../../../../../../Loader/Loader'

import {getCurrentAccountState} from '../../../../../../../../../../../state/currentAccount/selectors'

import {
    logEvent,
    SegmentEvent,
} from '../../../../../../../../../../../store/middlewares/segmentTracker'

import css from './EditOrderShippingAddressModal.less'

type OwnProps = {
    data?: {
        actionName: ShopifyActionType | null
        customer_id: string
        order_id: string
        current_shipping_address: Map<any, any>
    }
}

const defaultCurrentAddressState = fromJS({
    first_name: '',
    last_name: '',
    phone: '',
    address1: '',
    address2: '',
    company: '',
    city: '',
    country: '',
    province: '',
    zip: '',
}) as Map<any, any>

export function EditOrderShippingAddressModal(
    {
        isOpen,
        header,
        data = {
            actionName: null,
            customer_id: '',
            order_id: '',
            current_shipping_address: fromJS({}),
        },
        onClose,
        loading,
        loadingMessage,
        currentAccount,
        shippingAddresses,
        onInit,
        onChange,
        integrations,
        onSubmit,
        onReset,
        onBulkChange,
    }: Omit<InfobarModalProps, 'data'> &
        OwnProps &
        ConnectedProps<typeof connector>,
    {integrationId}: {integrationId: number}
) {
    const _getStatesList = (country: string) => {
        const stateObj = states.find((state) => state.name === country)
        if (stateObj && stateObj.provinces) return stateObj.provinces
        return []
    }

    const [dropdownOpen, setOpen] = useState(false)

    const [currentAddress, setCurrentAddress] = useState(
        data.current_shipping_address || defaultCurrentAddressState
    )

    const [provinces, setProvinces] = useState(
        _getStatesList(currentAddress.get('country'))
    )

    const _cureCurrentAddress = (currentAddress: Map<any, any>) => {
        const curedAddress = {}
        Object.keys(defaultCurrentAddressState.toJS()).forEach(function (key) {
            if (!currentAddress.get(key)) {
                // @ts-ignore
                curedAddress[key] = ''
            } else {
                // @ts-ignore
                curedAddress[key] = currentAddress.get(key)
            }
        })
        return curedAddress
    }

    const _handleSubmit = (event: FormEvent) => {
        event.preventDefault()
        onBulkChange(
            [
                {name: 'order_id', value: data.order_id || ''},
                {
                    name: 'payload',
                    value: _cureCurrentAddress(currentAddress),
                },
            ],
            () => {
                onSubmit()
                handleReset()
                logEvent(SegmentEvent.ShopifyEditOrderAddressEdited, {
                    account_id: currentAccount.get('domain'),
                    order_id: data.order_id,
                    country: currentAddress.get('country'),
                    zip: currentAddress.get('zip'),
                })
            }
        )
    }

    const handleCancel = useCallback(
        () => () => {
            logEvent(SegmentEvent.ShopifyEditOrderAddressCancel, {
                account_id: currentAccount.get('domain'),
                order_id: data.order_id,
            })
            setCurrentAddress(
                data.current_shipping_address || defaultCurrentAddressState
            )
            setProvinces(
                _getStatesList(data.current_shipping_address.get('country'))
            )
            onClose()
            handleReset()
        },
        [data, integrationId, onClose, data]
    )

    const previousIsOpen = usePrevious(isOpen)

    const handleReset = useCallback(() => {
        onReset()
        shortcutManager.unpause()
    }, [])

    const currentIntegration = useMemo(
        () =>
            integrations.find(
                (integration: Map<any, any>) =>
                    integration.get('id') === integrationId
            ) as Map<any, any> | null,
        [integrations, integrationId]
    )
    const hasScope = useMemo(
        () =>
            (
                currentIntegration?.getIn(['meta', 'oauth', 'scope']) as string
            ).includes('write_order_edits'),
        [currentIntegration]
    )

    const _updateField = (key: string, value: string) => {
        const newAddress = currentAddress.set(key, value)
        setCurrentAddress(newAddress)
    }

    const _onProvinceChange = (province: string | number) => {
        const newAddress = currentAddress.set('province', province)
        setCurrentAddress(newAddress)
    }
    const _onCountryChange = (value: string | number) => {
        setProvinces(_getStatesList(value as string))
        const newAddress = currentAddress
            .set('country', value)
            .set('province', '')
        setCurrentAddress(newAddress)
    }

    const getZipLine = (address: Map<any, any>) => {
        let zipLine = (address.get('city') as string) || ''

        ;['province', 'zip'].forEach(function (key: string) {
            if (address.get(key))
                zipLine = zipLine.concat(', ', address.get(key))
        })
        return zipLine
    }

    const toggle = () => {
        setOpen(!dropdownOpen)
        if (!dropdownOpen) {
            logEvent(SegmentEvent.ShopifyEditOrderAddressAddressDropdownOpen, {
                account_id: currentAccount.get('domain'),
                order_id: data.order_id,
            })
        }
    }

    const onDropDownClick = (event: MouseEvent) => {
        const selectedAddress = shippingAddresses.find(function (
            address: Map<any, any> | undefined
        ) {
            if (!address) return false
            const id = address.get('id') as string
            return id.toString() === event.currentTarget.id
        })
        setProvinces(_getStatesList(selectedAddress.get('country')))
        setCurrentAddress(selectedAddress)
        logEvent(SegmentEvent.ShopifyEditOrderAddressAddressDropdownClick, {
            account_id: currentAccount.get('domain'),
            order_id: data.order_id,
        })
    }

    useUpdateEffect(() => {
        if (!previousIsOpen && isOpen) {
            if (hasScope) {
                logEvent(SegmentEvent.ShopifyEditOrderAddressModalOpen, {
                    account_id: currentAccount.get('domain'),
                    order_id: data.order_id,
                })
                void onInit(integrationId, data.customer_id, () => {
                    onClose()
                    handleReset()
                })
            }
            shortcutManager.pause()
            if (data.order_id) {
                onChange('order_id', data.order_id)
            }
        }
    }, [
        isOpen,
        previousIsOpen,
        data,
        hasScope,
        integrationId,
        onClose,
        onChange,
    ])

    return (
        <Modal
            header={header}
            isOpen={isOpen}
            onClose={handleCancel()}
            keyboard={false}
            size="xl"
            bodyClassName="p-0"
            backdrop="static"
        >
            <Form onSubmit={_handleSubmit}>
                <div className={css.formBody}>
                    <div className="row">
                        <div className="col">
                            <ButtonDropdown
                                isOpen={dropdownOpen}
                                toggle={toggle}
                                className={css.addressDropDown}
                            >
                                <DropdownToggle
                                    className={css.addressDropDownToggle}
                                    caret
                                >
                                    Select another address
                                </DropdownToggle>
                                <DropdownMenu className={css.addressDropDown}>
                                    {shippingAddresses.map((address, index) => {
                                        if (!address) return
                                        return (
                                            <div key={address.get('id')}>
                                                <DropdownItem
                                                    id={address.get('id')}
                                                    onClick={onDropDownClick}
                                                >
                                                    {address.get('name')}
                                                    <br />
                                                    {address.get('address1')}
                                                    <br />
                                                    {address.get(
                                                        'address2'
                                                    ) && (
                                                        <>
                                                            {address.get(
                                                                'address2'
                                                            )}
                                                            <br />
                                                        </>
                                                    )}
                                                    {address.get('phone') && (
                                                        <>
                                                            {address.get(
                                                                'phone'
                                                            )}
                                                            <br />
                                                        </>
                                                    )}
                                                    {getZipLine(address)}

                                                    <br />
                                                    {address.get('country')}
                                                </DropdownItem>
                                                {shippingAddresses.size > 1 &&
                                                    index! <
                                                        shippingAddresses.size -
                                                            1 && (
                                                        <DropdownItem
                                                            key={
                                                                'divider' +
                                                                index!.toString()
                                                            }
                                                            divider
                                                        />
                                                    )}
                                            </div>
                                        )
                                    })}
                                </DropdownMenu>
                            </ButtonDropdown>
                        </div>
                        <div className="col"></div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <InputField
                                type="text"
                                name="firstName"
                                label="First Name"
                                placeholder="John"
                                value={currentAddress.get('first_name') || ''}
                                onChange={(value) =>
                                    _updateField('first_name', value)
                                }
                            />
                        </div>
                        <div className="col">
                            <InputField
                                type="text"
                                name="lastName"
                                label="Last Name"
                                placeholder="Doe"
                                value={currentAddress.get('last_name') || ''}
                                required
                                onChange={(value) =>
                                    _updateField('last_name', value)
                                }
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <InputField
                                type="text"
                                name="company"
                                label="Company"
                                placeholder="Corp & cie"
                                value={currentAddress.get('company') || ''}
                                onChange={(value) =>
                                    _updateField('company', value)
                                }
                            />
                        </div>
                        <div className="col">
                            <InputField
                                type="text"
                                name="phone"
                                label="Phone"
                                placeholder="+1 111 111 1111"
                                value={currentAddress.get('phone') || ''}
                                onChange={(value) =>
                                    _updateField('phone', value)
                                }
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <InputField
                                type="text"
                                name="address1"
                                label="Address 1"
                                placeholder="14 street"
                                required
                                value={currentAddress.get('address1') || ''}
                                onChange={(value) =>
                                    _updateField('address1', value)
                                }
                            />
                        </div>
                        <div className="col">
                            <InputField
                                type="text"
                                name="address2"
                                label="Address 2"
                                value={currentAddress.get('address2') || ''}
                                onChange={(value) =>
                                    _updateField('address2', value)
                                }
                            />
                        </div>
                    </div>
                    {provinces.length ? (
                        <div className="row">
                            <div className="col">
                                <FormGroup>
                                    <Label
                                        htmlFor="country"
                                        className={classnames(
                                            'control-label',
                                            css.required
                                        )}
                                    >
                                        Country
                                    </Label>
                                    <SelectField
                                        id="country"
                                        options={states.map((option) => ({
                                            value: option.name,
                                            label: option.name,
                                        }))}
                                        value={
                                            currentAddress.get('country') || ''
                                        }
                                        onChange={_onCountryChange}
                                        fullWidth
                                        required
                                    />
                                </FormGroup>
                            </div>
                            <div className="col">
                                <FormGroup>
                                    <Label
                                        htmlFor="province"
                                        className={classnames(
                                            'control-label',
                                            css.required
                                        )}
                                    >
                                        Province
                                    </Label>
                                    <SelectField
                                        id="province"
                                        options={provinces.map((option) => ({
                                            value: option,
                                            label: option,
                                        }))}
                                        value={
                                            currentAddress.get('province') || ''
                                        }
                                        onChange={_onProvinceChange}
                                        fullWidth
                                        required
                                    />
                                </FormGroup>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            <div className="col">
                                <FormGroup>
                                    <Label
                                        htmlFor="country"
                                        className={classnames(
                                            'control-label',
                                            css.required
                                        )}
                                    >
                                        Country
                                    </Label>
                                    <SelectField
                                        id="country"
                                        options={states.map((option) => ({
                                            value: option.name,
                                            label: option.name,
                                        }))}
                                        value={
                                            currentAddress.get('country') || ''
                                        }
                                        onChange={_onCountryChange}
                                        fullWidth
                                        required
                                    />
                                </FormGroup>
                            </div>
                        </div>
                    )}
                    <div className="row">
                        <div className="col">
                            <InputField
                                type="text"
                                name="city"
                                label="City"
                                placeholder="San Francisco"
                                required
                                value={currentAddress.get('city') || ''}
                                onChange={(value) =>
                                    _updateField('city', value)
                                }
                            />
                        </div>
                        <div className="col">
                            <InputField
                                type="text"
                                name="zip"
                                label="ZIP/Postal code"
                                value={currentAddress.get('zip') || ''}
                                onChange={(value) => _updateField('zip', value)}
                            />
                        </div>
                    </div>
                </div>
                <ModalFooter className={css.formFooter}>
                    <Button
                        tabIndex={0}
                        className={css.focusable}
                        onClick={handleCancel()}
                    >
                        Cancel
                    </Button>
                    {loading && (
                        <div className="ml-3">
                            <Loader
                                className={css.spinner}
                                minHeight="20px"
                                size="20px"
                            />
                            <span className="ml-2">{loadingMessage}</span>
                        </div>
                    )}
                    <Button
                        type="submit"
                        color="primary"
                        className={classnames(css.focusable, 'ml-auto')}
                        disabled={loading}
                    >
                        Save changes
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    )
}

EditOrderShippingAddressModal.contextTypes = {
    integrationId: PropTypes.number.isRequired,
}

const connector = connect(
    (state: RootState) => ({
        currentAccount: getCurrentAccountState(state),
        integrations: getIntegrationsByTypes([IntegrationType.Shopify])(state),
        shippingAddresses: getShippingAddressState(state).get(
            'addresses'
        ) as List<Map<any, any>>,
        loading: getShippingAddressState(state).get('loading'),
        loadingMessage: getShippingAddressState(state).get('loadingMessage'),
    }),
    {
        onInit,
        onReset,
    }
)

export default connector(EditOrderShippingAddressModal)
