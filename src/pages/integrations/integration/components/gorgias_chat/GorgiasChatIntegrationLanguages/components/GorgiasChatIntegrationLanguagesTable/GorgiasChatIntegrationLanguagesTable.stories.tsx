import { Meta, Story } from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'

import { GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS } from 'config/integrations/gorgias_chat'
import { Language } from 'constants/languages'

import {
    GorgiasChatIntegrationLanguagesTable,
    GorgiasChatIntegrationLanguagesTableProps,
} from './GorgiasChatIntegrationLanguagesTable'
import { GorgiasChatIntegrationLanguagesTableRow } from './GorgiasChatIntegrationLanguagesTableRow'
import { LanguageItemRow } from './types'

const rows: LanguageItemRow[] = GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.map(
    (option) => ({
        language: option?.get('value'),
        primary: option?.get('value') === Language.EnglishUs,
        label: option?.get('label'),
        link: '#',
        showActions: true,
    }),
).toJS()

const GorgiasChatIntegrationLanguagesTableChildren = () => {
    return (
        <>
            {rows.map((languageRow) => (
                <GorgiasChatIntegrationLanguagesTableRow
                    key={languageRow.language}
                    language={languageRow}
                    onClickSetDefault={(lang) => {
                        alert(`Set '${lang.language}' as default`)
                    }}
                    onClickDelete={(lang) => {
                        alert(`Deleted '${lang.language}' (not really)`)
                    }}
                />
            ))}
        </>
    )
}

const storyConfig: Meta = {
    argTypes: {},
    component: GorgiasChatIntegrationLanguagesTable,
    decorators: [(story) => <BrowserRouter>{story()}</BrowserRouter>],
    title: 'Chat/LanguagesTable',
}

const Template: Story<GorgiasChatIntegrationLanguagesTableProps> = (props) => (
    <GorgiasChatIntegrationLanguagesTable {...props} />
)

export const Default = Template.bind({})
Default.args = {
    children: <GorgiasChatIntegrationLanguagesTableChildren />,
}

export default storyConfig
