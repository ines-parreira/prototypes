import React, {FormEvent, useState} from 'react'
import {Form} from 'reactstrap'
import {fromJS, Map} from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getMagento2IntegrationByStoreUrl} from 'state/integrations/selectors'
import {updateOrCreateIntegrationRequest} from 'state/integrations/actions'
import Label from 'pages/common/forms/Label/Label'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import GroupAddon from 'pages/common/forms/input/GroupAddon'
import Caption from 'pages/common/forms/Caption/Caption'

import IntegrationActionButtons from './IntegrationActionButtons'
import {
    StoreAdminNewUrlInput,
    STORE_ADMIN_URL_INPUT_ID,
} from './StoreAdminNewUrlInput'

type Props = {
    integration: Map<string, any>
    isUpdate?: boolean
    isSubmitting: boolean
    redirectUri: string
}

const OneClickIntegrationForm = ({
    integration,
    isUpdate = false,
    isSubmitting,
    redirectUri,
}: Props) => {
    const dispatch = useAppDispatch()
    const meta: Map<string, any> = integration.getIn(['meta'], fromJS({}))

    const metaValues = {
        storeURL: meta.get('store_url', '') as string,
        adminURLSuffix: meta.get('admin_url_suffix', '') as string,
    }
    const [values, setValues] = useState(metaValues)

    const {storeURL} = values

    const existingMagento2Integration = useAppSelector(
        getMagento2IntegrationByStoreUrl(storeURL)
    )

    const error =
        !isUpdate &&
        !existingMagento2Integration.isEmpty() &&
        'There is already an integration for this Magento 2 store'

    const submitIsDisabled =
        isSubmitting ||
        Boolean(error) ||
        (!isUpdate && !storeURL) ||
        (isUpdate && meta.get('admin_url_suffix', '') === values.adminURLSuffix)

    const handleUpdate = () => {
        const meta: Map<string, any> = integration.get('meta')
        void dispatch(
            updateOrCreateIntegrationRequest(
                integration.merge({
                    meta: meta.merge({
                        admin_url_suffix: values.adminURLSuffix,
                        is_manual: false,
                        auth: null,
                    }),
                })
            )
        )
    }

    const handleCreate = () => {
        const splitAdminUrl = storeURL.split('/')
        const url = splitAdminUrl[0]
        const adminUrlSuffix = splitAdminUrl[1]
        window.location.href = redirectUri.concat(
            `?store_url=${url}&admin_url_suffix=${adminUrlSuffix}`
        )
    }

    return (
        <Form
            onSubmit={(event: FormEvent) => {
                event.preventDefault()

                if (isUpdate) {
                    handleUpdate()
                } else {
                    handleCreate()
                }
            }}
        >
            <Label
                htmlFor={STORE_ADMIN_URL_INPUT_ID}
                className="mb-2"
                isRequired
            >
                Store admin URL
            </Label>
            {isUpdate ? (
                <InputGroup className="mb-4">
                    <GroupAddon>{`https://${storeURL}/`}</GroupAddon>
                    <TextInput
                        id="store-field"
                        name="admin-url-suffix"
                        value={values.adminURLSuffix}
                        placeholder={'ex: admin_45f1c'}
                        onChange={(value) =>
                            setValues({
                                ...values,
                                adminURLSuffix: value,
                            })
                        }
                        isRequired
                    />
                </InputGroup>
            ) : (
                <>
                    <StoreAdminNewUrlInput
                        value={storeURL}
                        onChange={(value) =>
                            setValues({
                                ...values,
                                storeURL: value,
                            })
                        }
                    />
                    {error && <Caption error={error} />}
                </>
            )}

            <IntegrationActionButtons
                isUpdate={isUpdate}
                isSubmitting={isSubmitting}
                submitIsDisabled={submitIsDisabled}
                integration={integration}
                redirectUri={redirectUri}
            />
        </Form>
    )
}

export default OneClickIntegrationForm
