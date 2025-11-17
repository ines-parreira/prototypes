import { useState } from 'react'

import type { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import { TemplateCard } from 'pages/common/components/TemplateCard'

import UseCaseTemplateModal from './UseCaseTemplateModal'

import css from './UseCaseTemplateCard.less'

type Props = {
    template: ActionTemplate
    isOpenDefault?: boolean
}

const categoryTagStyleMap: {
    [key: string]: {
        color: string
        backgroundColor: string
    }
} = {
    Subscriptions: {
        color: 'var(--accessory-yellow-3)',
        backgroundColor: 'var(--accessory-yellow-1)',
    },
    Orders: {
        color: 'var(--accessory-blue-3)',
        backgroundColor: 'var(--accessory-blue-1',
    },
    'Returns & Exchanges': {
        color: 'var(--accessory-orange-3)',
        backgroundColor: 'var(--accessory-orange-1)',
    },
}

export default function UseCaseTemplateCard({
    template,
    isOpenDefault = false,
}: Props) {
    const { category, name } = template
    const [isModalOpen, setIsModalOpen] = useState(isOpenDefault)

    const tagStyle = category ? categoryTagStyleMap[category] : {}

    return (
        <>
            <TemplateCard
                title={name}
                tag={
                    <>
                        {category && (
                            <div className={css.tag} style={tagStyle}>
                                {category}
                            </div>
                        )}
                    </>
                }
                showOnlyTitle
                onClick={() => {
                    setIsModalOpen(true)
                }}
            />
            {isModalOpen && (
                <UseCaseTemplateModal
                    template={template}
                    onClose={() => {
                        setIsModalOpen(false)
                    }}
                />
            )}
        </>
    )
}
