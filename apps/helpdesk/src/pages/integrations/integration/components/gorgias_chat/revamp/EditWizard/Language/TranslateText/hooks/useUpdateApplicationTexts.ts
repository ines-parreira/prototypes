import { useMutation } from '@tanstack/react-query'

import type { Texts } from 'rest_api/gorgias_chat_protected_api/types'
import * as IntegrationsActions from 'state/integrations/actions'

type Variables = {
    applicationId: string
    texts: Texts
}

export const useUpdateApplicationTexts = () => {
    return useMutation({
        mutationFn: ({ applicationId, texts }: Variables) =>
            IntegrationsActions.updateApplicationTexts(applicationId, texts),
    })
}
