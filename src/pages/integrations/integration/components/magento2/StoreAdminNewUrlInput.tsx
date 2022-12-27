import React from 'react'

import InputGroup from 'pages/common/forms/input/InputGroup'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import TextInput from 'pages/common/forms/input/TextInput'

type Props = {
    value: string
    onChange: (value: string) => void
}

export const STORE_ADMIN_URL_INPUT_ID = 'store-field'

export const StoreAdminNewUrlInput = ({onChange, value}: Props) => (
    <InputGroup className="mb-4">
        <GroupAddon>https://</GroupAddon>
        <TextInput
            id={STORE_ADMIN_URL_INPUT_ID}
            name="admin-url"
            value={value}
            placeholder={'ex: acme.com/admin_45f1c'}
            onChange={(value) => {
                onChange(value.replace(/https?:\/\//i, '').trim())
            }}
            /**
             * Allows/requires strings like
             *   admin.hello.us/index.php
             *   admin.hello.us/hidden_admin
             *   admin.hello.us:31337/hidden_admin
             *   admin.hello.us:31337/index.php
             */
            pattern="^[a-z.0-9-]*\.[a-z0-9]*(:[0-9]+)?\/(index\.php)?[\/\w\d_-]*$"
            isRequired
        />
    </InputGroup>
)
