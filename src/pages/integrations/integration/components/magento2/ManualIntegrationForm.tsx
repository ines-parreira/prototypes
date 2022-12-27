import React from 'react'
import {Form} from 'reactstrap'
import _get from 'lodash/get'
import _some from 'lodash/some'
import {fromJS, Map} from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import {IntegrationType} from 'models/integration/types'
import {updateOrCreateIntegrationRequest} from 'state/integrations/actions'
import InputField from 'pages/common/forms/input/InputField'
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
}

const authInitialValues = {
    consumerKey: '',
    consumerSecret: '',
    accessToken: '',
    accessTokenSecret: '',
}

const placeholder = 'Current value is hidden for security reasons'

const ManualIntegrationForm = ({
    integration,
    isUpdate = false,
    isSubmitting,
}: Props) => {
    const dispatch = useAppDispatch()
    const meta: Map<any, any> = integration.getIn(['meta'], fromJS({}))
    const metaValues = {
        storeURL: meta.get('store_url', ''),
        adminURLSuffix: meta.get('admin_url_suffix', ''),
    }

    const currentValues = {...metaValues, ...authInitialValues}

    const [values, setValues] = React.useState(currentValues)
    const [errors, setErrors] = React.useState({})

    const {storeURL}: {storeURL: string} = values

    return (
        <Form
            onSubmit={(event) => {
                event.preventDefault()
                const anySecret = _some([
                    values.consumerKey,
                    values.consumerSecret,
                    values.accessToken,
                    values.accessTokenSecret,
                ])

                const auth = anySecret
                    ? {
                          consumer_key: values.consumerKey,
                          consumer_secret: values.consumerSecret,
                          oauth_token: values.accessToken,
                          oauth_token_secret: values.accessTokenSecret,
                      }
                    : null

                const data = {
                    type: IntegrationType.Magento2,
                    ...(auth && {connections: [{data: auth}]}),
                    deactivated_datetime: null,
                    meta: {
                        store_url: values.storeURL,
                        admin_url_suffix: values.adminURLSuffix,
                        is_manual: true,
                    },
                }
                void dispatch(
                    updateOrCreateIntegrationRequest(
                        integration.mergeDeep(data)
                    )
                ).then((response) => {
                    const error = _get(response, 'error')

                    if (error) {
                        const {meta} = _get(error, 'response.data.error.data')
                        if (meta) {
                            setErrors(meta)
                        }
                    }
                })
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
                        id={STORE_ADMIN_URL_INPUT_ID}
                        name="admin-url-suffix"
                        value={values.adminURLSuffix}
                        placeholder={'ex: admin_45f1c'}
                        onChange={(value) =>
                            setValues({
                                ...values,
                                ...{adminURLSuffix: value},
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
                    {Boolean(_get(errors, 'store_url')) && (
                        <Caption error={_get(errors, 'store_url')} />
                    )}
                </>
            )}

            <InputField
                className="mb-4"
                name="consumerKey"
                placeholder={isUpdate ? placeholder : undefined}
                label="Consumer key"
                value={values.consumerKey}
                onChange={(value: string) =>
                    setValues({...values, ...{consumerKey: value}})
                }
                isRequired={!isUpdate}
            />

            <InputField
                className="mb-4"
                name="consumerSecret"
                placeholder={isUpdate ? placeholder : undefined}
                label="Consumer secret"
                value={values.consumerSecret}
                onChange={(value: string) =>
                    setValues({...values, ...{consumerSecret: value}})
                }
                isRequired={!isUpdate}
            />

            <InputField
                name="accessToken"
                className="mb-4"
                placeholder={isUpdate ? placeholder : undefined}
                label="Access token"
                value={values.accessToken}
                onChange={(value: string) =>
                    setValues({...values, ...{accessToken: value}})
                }
                isRequired={!isUpdate}
            />

            <InputField
                name="accessTokenSecret"
                className="mb-4"
                placeholder={isUpdate ? placeholder : undefined}
                label="Access token secret"
                value={values.accessTokenSecret}
                onChange={(value: string) =>
                    setValues({...values, ...{accessTokenSecret: value}})
                }
                isRequired={!isUpdate}
            />

            <IntegrationActionButtons
                integration={integration}
                isUpdate={isUpdate}
                isSubmitting={isSubmitting}
                submitIsDisabled={
                    (!isUpdate &&
                        (!values.storeURL ||
                            !values.consumerKey ||
                            !values.consumerSecret ||
                            !values.accessToken ||
                            !values.accessTokenSecret)) ||
                    (isUpdate && !values.adminURLSuffix)
                }
            />
        </Form>
    )
}

export default ManualIntegrationForm
