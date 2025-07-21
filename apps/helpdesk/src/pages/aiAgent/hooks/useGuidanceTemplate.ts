import { useMemo } from 'react'

import { GuidanceTemplatesData } from './useGuidanceTemplates'

export const useGuidanceTemplate = (templateId: string) => {
    const guidanceTemplate = useMemo(
        () => GuidanceTemplatesData.find(({ id }) => id === templateId),
        [templateId],
    )

    return { guidanceTemplate }
}
