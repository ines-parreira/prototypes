import { BrowserRouter } from 'react-router-dom'
import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS } from 'config/integrations/gorgias_chat'
import { Language } from 'constants/languages'

import { GorgiasChatIntegrationLanguagesTable } from './GorgiasChatIntegrationLanguagesTable'
import { GorgiasChatIntegrationLanguagesTableRow } from './GorgiasChatIntegrationLanguagesTableRow'
import type { LanguageItemRow } from './types'

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

type Story = StoryObj<typeof GorgiasChatIntegrationLanguagesTable>

const Template: Story = {
    render: (props) => <GorgiasChatIntegrationLanguagesTable {...props} />,
}

export const Default = {
    ...Template,
    args: {
        children: <GorgiasChatIntegrationLanguagesTableChildren />,
    },
}

export default storyConfig
