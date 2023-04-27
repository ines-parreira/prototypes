import {useState} from 'react'
import {createVerification} from 'models/singleSenderVerification/resources'
import {SenderInformation} from 'models/singleSenderVerification/types'
import {EmailMigrationSenderVerificationIntegration} from 'models/integration/types'

export default function useBulkCreateSingleSenderVerification() {
    const [isLoading, setIsLoading] = useState(false)

    const bulkCreateSingleSenderVerification = async (
        integrations: EmailMigrationSenderVerificationIntegration[],
        values: Omit<SenderInformation, 'email'>
    ) => {
        setIsLoading(true)
        const requests = integrations.map((integration) =>
            createVerification(integration.id, {
                ...values,
                email: integration.meta.address,
            })
        )
        // @ts-ignore-next-line
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await Promise.allSettled(requests)

        setIsLoading(false)
    }

    return {
        isLoading,
        bulkCreateSingleSenderVerification,
    }
}
