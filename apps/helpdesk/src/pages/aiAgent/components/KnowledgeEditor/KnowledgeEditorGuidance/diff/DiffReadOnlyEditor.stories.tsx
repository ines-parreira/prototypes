import React, { useMemo } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { contentStateFromTextOrHTML } from 'utils/editor'

import { DiffReadOnlyEditor } from './DiffReadOnlyEditor'
import { computeUnifiedDiff } from './diffUtils'

const meta: Meta<typeof DiffReadOnlyEditor> = {
    title: 'AI Agent/Knowledge/KnowledgeEditor/DiffReadOnlyEditor',
    component: DiffReadOnlyEditor,
}

export default meta

type Story = StoryObj<typeof DiffReadOnlyEditor>

const oldContent = `
<ol>
  <li>Step one</li>
  <li>Step two
    <ol>
      <li>Nested level one
        <ol>
          <li>Nested level two item one</li>
          <li>Nested level two item two</li>
        </ol>
      </li>
      <li>Second nested item</li>
    </ol>
  </li>
</ol>
`

const newContent = `
<ol>
  <li>Step one</li>
  <li>Step two updated
    <ol>
      <li>Nested level one
        <ol>
          <li>Nested level two item one updated</li>
          <li>Nested level two item two</li>
          <li>Nested level two item three</li>
        </ol>
      </li>
      <li>Second nested item</li>
    </ol>
  </li>
</ol>
`

function DiffReadOnlyEditorStory() {
    const mergedContentState = useMemo(() => {
        const oldContentState = contentStateFromTextOrHTML(
            undefined,
            oldContent,
        )
        const newContentState = contentStateFromTextOrHTML(
            undefined,
            newContent,
        )

        return computeUnifiedDiff(oldContentState, newContentState)
            .mergedContentState
    }, [])

    return (
        <div style={{ maxWidth: '760px' }}>
            <DiffReadOnlyEditor contentState={mergedContentState} />
        </div>
    )
}

export const NestedOrderedLists: Story = {
    render: () => <DiffReadOnlyEditorStory />,
}
