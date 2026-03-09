import type { ComponentProps } from 'react'
import React, { useState } from 'react'

import { history } from '@repo/routing'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn, StoryObj } from 'storybook-react-rsbuild'

import { ThemeProvider } from 'core/theme'

import { KnowledgeEditorGuidanceEditView } from './KnowledgeEditorGuidanceEditView'

const meta: Meta<typeof KnowledgeEditorGuidanceEditView> = {
    title: 'AI Agent/Knowledge/KnowledgeEditor/KnowledgeEditorGuidanceEditView',
    component: KnowledgeEditorGuidanceEditView,
    argTypes: {},
}

export default meta

type Story = StoryObj<typeof KnowledgeEditorGuidanceEditView>

const Template: StoryFn<
    Omit<
        ComponentProps<typeof KnowledgeEditorGuidanceEditView>,
        'availableActions' | 'onChangeTitle' | 'onChangeContent'
    >
> = (args) => {
    const [content, setContent] = useState(args.content)
    const [title, setTitle] = useState(args.title)

    return (
        <ThemeProvider>
            <Provider
                store={configureMockStore()({
                    ui: { editor: { isFocused: false } },
                })}
            >
                <Router history={history}>
                    <KnowledgeEditorGuidanceEditView
                        {...args}
                        availableActions={[
                            {
                                name: 'TOTO action',
                                value: '00AAAAA7AAA0AAA1A50AAAA00A',
                            },
                        ]}
                        onChangeContent={setContent}
                        onChangeTitle={setTitle}
                        content={content}
                        title={title}
                    />
                </Router>
            </Provider>
        </ThemeProvider>
    )
}

const content = `<div>When a customer asks how to set up a view for multiple integrations (e.g. several different email addresses, or several different chat integrations):</div><div><br></div><ul><li>If the customer wants to see all the integrations from this channel (e.g. all integrated email addresses) in one view, instruct them to use the <strong>Channel is</strong> filter and select the said channel</li><li>If the customer wants to see some, but not all the integrations from this channel (e.g. a couple of their integrated email addresses) in one view, instruct them to use the <strong>Integration is one of</strong> filter</li></ul><div><br></div><div> When a customer asks how to bulk delete tickets:</div><div><br></div><ol><li>Share this article <u><a href="https://docs.gorgias.com/en-US/bulk-actions-81849" target="_blank">https://docs.gorgias.com/en-US/bulk-actions-81849</a></u>. </li><li><em>Advise that it is applicable to all Views</em></li></ol><div><br></div><div><br></div><div>You can use <u>emoticons</u> such as 😄😇👍.</div><div><br></div><div>You can call the customer &amp;&amp;&amp;customer.name&amp;&amp;&amp;.</div><div><br></div><div>You can use $$$00AAAAA7AAA0AAA1A50AAAA00A$$$</div>`

export const EditView: Story = Template.bind({})
EditView.args = {
    content,
    title: 'Test Title',
    shopName: 'Test Shop',
}
