import React from 'react'

import { Link } from 'react-router-dom'

import { Label } from '@gorgias/axiom'

import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'

import SyncNotificationNew from './SyncNotificationNew'

import css from './StoreInformationForm.less'

export interface StoreInformationFormProps {
    shopName: string
    isCustomersImportOver: boolean
    syncCustomerNotes: boolean
    defaultAddressPhoneMatchingEnabled: boolean
    onSyncCustomerNotesChange: (value: boolean) => void
    onDefaultAddressPhoneMatchingChange: (value: boolean) => void
    storeId: number
    isActive: boolean
}

export function StoreInformationForm({
    shopName,
    isCustomersImportOver,
    syncCustomerNotes,
    defaultAddressPhoneMatchingEnabled,
    onSyncCustomerNotesChange,
    onDefaultAddressPhoneMatchingChange,
    storeId,
    isActive,
}: StoreInformationFormProps) {
    return (
        <SettingsCard>
            <SettingsCardHeader>
                <SettingsCardTitle>Store Information</SettingsCardTitle>
                <p>
                    View your store details and manage how data is shared with
                    Gorgias. You can also access this information in
                    <Link to={`/app/settings/integrations/shopify/${storeId}`}>
                        {' '}
                        My Apps.
                    </Link>
                </p>
            </SettingsCardHeader>
            <SettingsCardContent>
                <div className={css.metaContainer}>
                    <SyncNotificationNew
                        isActive={isActive}
                        platform="Shopify"
                        shopName={shopName}
                        isSyncComplete={isCustomersImportOver}
                    />
                    <div className={css.storeName}>
                        <Label htmlFor="store-name">Store name</Label>
                        <InputGroup isDisabled>
                            <TextInput name="store-name" value={shopName} />
                            <GroupAddon className={css.storeSuffix}>
                                .myshopify.com
                            </GroupAddon>
                        </InputGroup>
                    </div>
                </div>
                <SettingsFeatureRow
                    title="Sync customer notes with Shopify"
                    description="The first saved edit will sync if notes are updated in Shopify and Gorgias at once. Syncing is disabled for customers linked to multiple Shopify stores."
                    type="toggle"
                    isChecked={syncCustomerNotes}
                    onChange={onSyncCustomerNotesChange}
                    toggleName="toggle-sync-customer-notes"
                />
                <SettingsFeatureRow
                    title="Enable customer matching with Shopify"
                    description="Gorgias uses the phone number from the default Shopify address to match customers. Do not enable if phone numbers are reused across multiple profiles as this will lead to incorrect customer merges."
                    type="toggle"
                    isChecked={defaultAddressPhoneMatchingEnabled}
                    onChange={onDefaultAddressPhoneMatchingChange}
                    toggleName="toggle-enable-customer-matching"
                />
            </SettingsCardContent>
        </SettingsCard>
    )
}
