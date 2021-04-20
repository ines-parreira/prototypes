import React, {FormEvent} from 'react'

import {Form} from 'reactstrap'

import {fromJS, Map} from 'immutable'
import {connect} from 'react-redux'

import InputField from '../../../../common/forms/InputField.js'

import * as integrationSelectors from '../../../../../state/integrations/selectors'
import {RootState} from '../../../../../state/types'

import Magento2IntegrationActionButtons from './Magento2IntegrationActionButtons'

type Props = {
    integration: Map<string, any>
    actions: {
        updateOrCreateIntegration: (
            integration: Map<string, any>
        ) => Promise<void>
        deactivateIntegration: (integration: Map<string, any>) => Promise<void>
        activateIntegration: (integration: Map<string, any>) => Promise<void>
        deleteIntegration: (integration: Map<string, any>) => Promise<void>
    }
    isUpdate: boolean
    isSubmitting: boolean
    redirectUri: string
    getExistingMagento2Integration: (arg0: string) => Map<any, any>
}

const handleCreate = (
    values: {storeURL: string},
    redirectUri: string
): void => {
    const splitAdminUrl = values.storeURL.split('/')
    const url = splitAdminUrl[0]
    const adminUrlSuffix = splitAdminUrl[1]

    window.location.href = redirectUri.concat(
        `?store_url=${url}&admin_url_suffix=${adminUrlSuffix}`
    )
}

const handleUpdate = (
    values: {adminURLSuffix: string},
    integration: Map<string, any>,
    actions: Props['actions']
): void => {
    const meta: Map<string, any> = integration.get('meta')
    void actions.updateOrCreateIntegration(
        integration.merge({
            meta: meta.merge({
                admin_url_suffix: values.adminURLSuffix,
                is_manual: false,
                auth: null,
            }),
        })
    )
}

export const Magento2OneClickIntegrationForm = ({
    integration,
    isUpdate,
    isSubmitting,
    actions,
    redirectUri,
    getExistingMagento2Integration,
}: Props) => {
    const meta: Map<string, any> = integration.getIn(['meta'], fromJS({}))

    const metaValues = {
        storeURL: meta.get('store_url', ''),
        adminURLSuffix: meta.get('admin_url_suffix', ''),
    }

    const [values, setValues] = React.useState(metaValues)

    const {storeURL}: {storeURL: string} = values

    const error =
        !isUpdate && !getExistingMagento2Integration(storeURL).isEmpty()
            ? 'There is already an integration for this Magento 2 store'
            : null

    const submitIsDisabled = isSubmitting || !!error

    return (
        <Form
            onSubmit={(event: FormEvent) => {
                event.preventDefault()

                if (isUpdate) {
                    handleUpdate(values, integration, actions)
                } else {
                    handleCreate(values, redirectUri)
                }
            }}
        >
            <div className="mb-4">
                {isUpdate ? (
                    <InputField
                        key="input"
                        type="text"
                        name="admin_url_suffix"
                        label="Store admin URL"
                        placeholder={'ex: admin_45f1c'}
                        leftAddon={`https://${storeURL}/`}
                        value={values.adminURLSuffix}
                        error={error}
                        onChange={(value: string) =>
                            setValues({
                                ...values,
                                ...{adminURLSuffix: value},
                            })
                        }
                        required
                    />
                ) : (
                    <InputField
                        type="text"
                        name="name"
                        label="Store admin URL"
                        placeholder={'ex: acme.com/admin_45f1c'}
                        value={values.storeURL}
                        error={error}
                        leftAddon="https://"
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

            <Magento2IntegrationActionButtons
                isUpdate={isUpdate}
                isSubmitting={isSubmitting}
                submitIsDisabled={submitIsDisabled}
                actions={actions}
                integration={integration}
            />
        </Form>
    )
}

const mapStateToProps = (state: RootState) => {
    return {
        getExistingMagento2Integration: integrationSelectors.makeGetMagento2IntegrationByStoreUrl(
            state
        ),
    }
}

export default connect(mapStateToProps)(Magento2OneClickIntegrationForm)
