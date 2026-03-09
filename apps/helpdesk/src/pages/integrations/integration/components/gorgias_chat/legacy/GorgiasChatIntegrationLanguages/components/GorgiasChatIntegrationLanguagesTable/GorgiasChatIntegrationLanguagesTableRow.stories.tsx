import { BrowserRouter } from 'react-router-dom'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { Language } from 'constants/languages'

import { GorgiasChatIntegrationLanguagesTable } from './GorgiasChatIntegrationLanguagesTable'
import type { GorgiasChatIntegrationLanguagesTableRowProps } from './GorgiasChatIntegrationLanguagesTableRow'
import { GorgiasChatIntegrationLanguagesTableRow } from './GorgiasChatIntegrationLanguagesTableRow'
import type { LanguageItemRow } from './types'

const storyConfig: Meta = {
    argTypes: {},
    component: GorgiasChatIntegrationLanguagesTableRow,
    decorators: [(story) => <BrowserRouter>{story()}</BrowserRouter>],
    title: 'Chat/LanguagesTableRow',
}

type Story = StoryObj<typeof GorgiasChatIntegrationLanguagesTableRow>

const Template: Story = {
    render: ({ language, onClickDelete, onClickSetDefault }) => {
        return (
            <GorgiasChatIntegrationLanguagesTable>
                <GorgiasChatIntegrationLanguagesTableRow
                    language={language}
                    onClickSetDefault={onClickSetDefault}
                    onClickDelete={onClickDelete}
                />
            </GorgiasChatIntegrationLanguagesTable>
        )
    },
}

const defaultProps: Partial<GorgiasChatIntegrationLanguagesTableRowProps> = {
    language: {
        language: Language.EnglishUs,
        primary: true,
        label: 'English (US)',
        link: '/integrations/1/chat/languages/en-US',
        showActions: false,
    },
}

export const Default = {
    ...Template,
    args: defaultProps,
}

export const DefaultWithActions = {
    ...Template,
    args: {
        ...defaultProps,
        language: {
            language: Language.EnglishUs,
            primary: true,
            label: 'English (US)',
            link: '/integrations/1/chat/languages/en-US',
            showActions: true,
        },
        onClickSetDefault: (lang: LanguageItemRow) => {
            alert(`Set '${lang.language}' as default`)
        },
        onClickDelete: (lang: LanguageItemRow) => {
            alert(`Delete '${lang.language}'`)
        },
    },
}

export const NotDefaultWithActions = {
    ...Template,
    args: {
        ...defaultProps,
        language: {
            language: Language.EnglishUs,
            primary: false,
            label: 'English (US)',
            link: '/integrations/1/chat/languages/en-US',
            showActions: true,
        },
        onClickSetDefault: (lang: LanguageItemRow) => {
            alert(`Set '${lang.language}' as default`)
        },
        onClickDelete: (lang: LanguageItemRow) => {
            alert(`Delete '${lang.language}'`)
        },
    },
}

export default storyConfig
