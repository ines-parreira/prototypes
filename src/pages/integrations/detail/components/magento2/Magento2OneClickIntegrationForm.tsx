import React, {FormEvent, useCallback} from 'react'
import {Form} from 'reactstrap'
import {fromJS, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import {makeGetMagento2IntegrationByStoreUrl} from '../../../../../state/integrations/selectors'
import {updateOrCreateIntegration} from '../../../../../state/integrations/actions'
import {RootState} from '../../../../../state/types'

import Magento2IntegrationActionButtons from './Magento2IntegrationActionButtons'

type Props = {
    integration: Map<string, any>
    isUpdate: boolean
    isSubmitting: boolean
    redirectUri: string
} & ConnectedProps<typeof connector>

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

export const Magento2OneClickIntegrationForm = ({
    integration,
    isUpdate,
    isSubmitting,
    updateOrCreateIntegration,
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

    const handleUpdate = useCallback(
        (values: {adminURLSuffix: string}): void => {
            const meta: Map<string, any> = integration.get('meta')
            void updateOrCreateIntegration(
                integration.merge({
                    meta: meta.merge({
                        admin_url_suffix: values.adminURLSuffix,
                        is_manual: false,
                        auth: null,
                    }),
                })
            )
        },
        [integration]
    )

    return (
        <Form
            onSubmit={(event: FormEvent) => {
                event.preventDefault()

                if (isUpdate) {
                    handleUpdate(values)
                } else {
                    handleCreate(values, redirectUri)
                }
            }}
        >
            <div className="mb-4">
                {isUpdate ? (
                    <DEPRECATED_InputField
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
                    <DEPRECATED_InputField
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
                integration={integration}
                redirectUri={redirectUri}
            />
        </Form>
    )
}

const connector = connect(
    (state: RootState) => {
        return {
            getExistingMagento2Integration:
                makeGetMagento2IntegrationByStoreUrl(state),
        }
    },
    {updateOrCreateIntegration}
)

export default connector(Magento2OneClickIntegrationForm)
