import React, {Fragment, useEffect, useState} from 'react'
import {Map} from 'immutable'

import InputField from 'pages/common/forms/input/InputField'
import Button from 'pages/common/components/button/Button'

import {MigrationProvider} from '../../types'

import ProviderInfo from '../ProviderInfo'
import MigrationBaseModal from '../MigrationBaseModal'
import MigrationBaseModalBody from '../MigrationBaseModalBody'

type Props = {
    isOpen: boolean
    onClose: () => void

    provider: MigrationProvider

    onSubmit: (values: Map<string, string>) => void
    isLoading: boolean
    errors?: Map<string, string[]>
}

const MigrationCredentialsModal: React.FC<Props> = ({
    isOpen,
    onClose,

    provider,

    onSubmit,
    isLoading,
    errors,
}) => {
    const [fieldsValue, setFieldsValue] = useState(Map<string, string>())
    const [fieldsErrors, setFieldsErrors] = useState(Map<string, string[]>())

    useEffect(() => {
        if (errors) {
            setFieldsErrors(errors)
        }
    }, [errors])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        let errors = Map<string, string[]>()

        // Just in case the browser doesn't validate and prevent form submission
        provider.properties?.forEach((fieldConfig) => {
            if (!fieldsValue.get(fieldConfig.name)) {
                errors = errors.set(fieldConfig.name, [
                    'This field is required',
                ])
            }
        })

        const anyErrors = !errors.isEmpty()
        if (anyErrors) setFieldsErrors(errors)
        else {
            onSubmit(fieldsValue)
        }
    }

    return (
        <MigrationBaseModal
            title="Setup migration"
            isOpen={isOpen}
            onClose={onClose}
        >
            <MigrationBaseModalBody>
                <ProviderInfo provider={provider} />
                <div className="mb-4" />

                <h4>Enter your API credentials</h4>
                <p>
                    Need help finding this info? Follow{' '}
                    <a href={provider.docs_url} rel="noopener noreferrer">
                        these instructions
                    </a>{' '}
                    from {provider.title}.
                </p>
                <div className="mb-4" />

                <form onSubmit={handleSubmit}>
                    {provider.properties?.map((fieldConfig, idx) => (
                        <Fragment key={idx}>
                            <InputField
                                // `|| '' ` for removing the warning of changing the controlled/uncontrolled state of input
                                value={fieldsValue.get(fieldConfig.name) || ''}
                                onChange={(newValue) =>
                                    setFieldsValue((prev) =>
                                        prev.set(fieldConfig.name, newValue)
                                    )
                                }
                                isRequired
                                label={fieldConfig.title}
                                name={fieldConfig.name}
                                placeholder={fieldConfig.description}
                                type={fieldConfig.format}
                                // Prevent prefilling with some browser's saved data
                                autoComplete="new-password"
                                error={fieldsErrors.get(fieldConfig.name)?.[0]}
                            />
                            <div className="mb-4" />
                        </Fragment>
                    ))}

                    <Button
                        type="submit"
                        className="w-100"
                        intent="primary"
                        fillStyle="fill"
                        isLoading={isLoading}
                    >
                        {isLoading ? 'Connecting' : 'Connect'}
                    </Button>
                </form>
                <div className="mb-4" />
                <p className="mb-0">
                    By providing your API credentials to {provider.title},
                    you’re enabling us to retrieve your {provider.title} data.
                </p>
            </MigrationBaseModalBody>
        </MigrationBaseModal>
    )
}

export default MigrationCredentialsModal
