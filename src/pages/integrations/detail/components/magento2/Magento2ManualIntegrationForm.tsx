import React from 'react'
import {Form} from 'reactstrap'
import _get from 'lodash/get'
import _some from 'lodash/some'
import {fromJS, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import InputField from '../../../../common/forms/InputField.js'
import {MAGENTO2_INTEGRATION_TYPE} from '../../../../../constants/integration'
import {updateOrCreateIntegration} from '../../../../../state/integrations/actions'

import Magento2IntegrationActionButtons from './Magento2IntegrationActionButtons'

type Props = {
    integration: Map<string, any>
    isUpdate: boolean
    isSubmitting: boolean
} & ConnectedProps<typeof connector>

const authInitialValues = {
    consumerKey: '',
    consumerSecret: '',
    accessToken: '',
    accessTokenSecret: '',
}

const placeholder = 'Hidden for security reasons'

export const Magento2ManualIntegrationForm = ({
    integration,
    updateOrCreateIntegration,
    isUpdate,
    isSubmitting,
}: Props) => {
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
                    type: MAGENTO2_INTEGRATION_TYPE,
                    ...(auth && {connections: [{data: auth}]}),
                    deactivated_datetime: null,
                    meta: {
                        store_url: values.storeURL,
                        admin_url_suffix: values.adminURLSuffix,
                        is_manual: true,
                    },
                }
                void updateOrCreateIntegration(
                    integration.mergeDeep(data)
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
            <div className="mb-4">
                {isUpdate ? (
                    <InputField
                        key="input"
                        type="text"
                        name="adminUrlSuffix"
                        label="Store admin URL"
                        placeholder={placeholder}
                        leftAddon={`https://${storeURL}/`}
                        value={values.adminURLSuffix}
                        onChange={(value: string) =>
                            setValues({...values, ...{adminURLSuffix: value}})
                        }
                        required={false}
                    />
                ) : (
                    <InputField
                        type="text"
                        name="name"
                        label="Store admin URL"
                        placeholder={'ex: acme.com/admin_45f1c'}
                        value={values.storeURL}
                        leftAddon="https://"
                        error={_get(errors, 'store_url')}
                        onChange={(value: string) =>
                            setValues({
                                ...values,
                                ...{
                                    storeURL: value
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .trim(),
                                },
                            })
                        }
                        pattern="^[a-z.0-9-]*\.[a-z0-9]*\/(index\.php)?[\/\w\d_-]*$"
                        required
                    />
                )}
            </div>
            <div className="mb-4">
                <InputField
                    key="input"
                    type="text"
                    name="consumerKey"
                    placeholder={isUpdate ? placeholder : undefined}
                    label="Consumer Key"
                    value={values.consumerKey}
                    onChange={(value: string) =>
                        setValues({...values, ...{consumerKey: value}})
                    }
                    required={!isUpdate}
                />
            </div>
            <div className="mb-4">
                <InputField
                    key="input"
                    type="text"
                    name="consumerSecret"
                    placeholder={isUpdate ? placeholder : undefined}
                    label="Consumer Secret"
                    value={values.consumerSecret}
                    onChange={(value: string) =>
                        setValues({...values, ...{consumerSecret: value}})
                    }
                    required={!isUpdate}
                />
            </div>
            <div className="mb-4">
                <InputField
                    key="input"
                    type="text"
                    name="accessToken"
                    placeholder={isUpdate ? placeholder : undefined}
                    label="Access Token"
                    value={values.accessToken}
                    onChange={(value: string) =>
                        setValues({...values, ...{accessToken: value}})
                    }
                    required={!isUpdate}
                />
            </div>
            <div className="mb-4">
                <InputField
                    key="input"
                    type="text"
                    name="accessTokenSecret"
                    placeholder={isUpdate ? placeholder : undefined}
                    label="Access Token Secret"
                    value={values.accessTokenSecret}
                    onChange={(value: string) =>
                        setValues({...values, ...{accessTokenSecret: value}})
                    }
                    required={!isUpdate}
                />
            </div>

            <Magento2IntegrationActionButtons
                integration={integration}
                isUpdate={isUpdate}
                isSubmitting={isSubmitting}
                submitIsDisabled={false}
            />
        </Form>
    )
}

const connector = connect(null, {updateOrCreateIntegration})

export default connector(Magento2ManualIntegrationForm)
