import {useMemo} from 'react'
import {GuidanceTemplateKey} from '../types'
import {GuidanceTemplatesData} from './useGuidanceTemplates'

export const useGuidanceTemplate = (templateKey: GuidanceTemplateKey) => {
    const guidanceTemplate = useMemo(
        () => GuidanceTemplatesData[templateKey],
        [templateKey]
    )

    return {guidanceTemplate}
}
