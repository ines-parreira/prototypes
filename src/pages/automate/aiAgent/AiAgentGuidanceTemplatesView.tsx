import React from 'react'
import {useGuidanceTemplates} from './hooks/useGuidanceTemplates'
import {GuidanceTemplatesList} from './components/GuidanceTemplatesList/GuidanceTemplatesList'

type Props = {
    shopName: string
}

export const AiAgentGuidanceTemplatesView = ({shopName}: Props) => {
    const {guidanceTemplates} = useGuidanceTemplates()

    return (
        <div>
            <h3 className="heading-section-semibold">
                Start with a template that you can customize to fit your needs:
            </h3>

            <GuidanceTemplatesList
                guidanceTemplates={guidanceTemplates}
                shopName={shopName}
            />
        </div>
    )
}
