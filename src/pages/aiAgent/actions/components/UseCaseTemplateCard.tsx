import React, {useState} from 'react'

import {ActionTemplate} from 'pages/automate/actionsPlatform/types'
import {TemplateCard} from 'pages/common/components/TemplateCard'

import css from './UseCaseTemplateCard.less'
import UseCaseTemplateModal from './UseCaseTemplateModal'

type Props = {
    template: ActionTemplate
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

export default function UseCaseTemplateCard({template}: Props) {
    const {category, name} = template
    const [isModalOpen, setIsModalOpen] = useState(false)

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
