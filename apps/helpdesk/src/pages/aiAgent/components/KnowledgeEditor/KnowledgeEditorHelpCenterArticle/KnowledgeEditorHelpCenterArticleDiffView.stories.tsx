import React from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { KnowledgeEditorHelpCenterArticleDiffView } from './KnowledgeEditorHelpCenterArticleDiffView'

const meta: Meta<typeof KnowledgeEditorHelpCenterArticleDiffView> = {
    title: 'AI Agent/Knowledge/KnowledgeEditor/KnowledgeEditorHelpCenterArticleDiffView',
    component: KnowledgeEditorHelpCenterArticleDiffView,
}

export default meta

type Story = StoryObj<typeof KnowledgeEditorHelpCenterArticleDiffView>

const oldContent = `
<p>This article explains how to configure the flow.</p>
<ol>
  <li>Open the dashboard</li>
  <li>Configure settings
    <ol type="i">
      <li>Pick source</li>
      <li>Confirm destination</li>
    </ol>
  </li>
</ol>
`

const newContent = `
<p>This article explains how to configure the flow quickly.</p>
<ol>
  <li>Open the dashboard</li>
  <li>Configure settings
    <ol type="i">
      <li>Pick source</li>
      <li>Confirm destination</li>
      <li>Save and validate</li>
    </ol>
  </li>
</ol>
`

export const NestedOrderedLists: Story = {
    args: {
        oldTitle: 'How to configure the flow',
        newTitle: 'How to configure the flow (updated)',
        oldContent,
        newContent,
    },
}

const oldParagraphBulletsContent = `
<p>Spare parts available:</p>
<p>- Cash bands</p>
<p>- Finder Card charging cable</p>
<p>- Backpack straps</p>
<p>Escalation path:</p>
<p>1) Verify the order</p>
<p>2) Handover ticket</p>
`

const newParagraphBulletsContent = `
<p><u>Spare parts available:</u></p>
<ul>
  <li>Cash bands</li>
  <li>Finder Card charging cable (Android and Apple only)</li>
  <li>Backpack straps</li>
</ul>
<ol>
  <li><strong>Verify the order</strong></li>
  <li>Handover ticket</li>
</ol>
`

export const ParagraphBulletsToLists: Story = {
    args: {
        oldTitle: 'Spare parts workflow',
        newTitle: 'Spare parts workflow (updated)',
        oldContent: oldParagraphBulletsContent,
        newContent: newParagraphBulletsContent,
    },
}

const oldDeepNestedResetContent = `
<ol>
  <li><strong>Troubleshooting flow</strong>
    <ol>
      <li>First branch
        <ol>
          <li>Check battery</li>
          <li>Check firmware</li>
        </ol>
      </li>
      <li>Second branch
        <ol>
          <li>Collect logs</li>
        </ol>
      </li>
    </ol>
  </li>
</ol>
`

const newDeepNestedResetContent = `
<ol>
  <li><strong>Troubleshooting flow</strong>
    <ol>
      <li>First branch
        <ol>
          <li>Check battery health</li>
          <li>Check firmware version</li>
          <li>Check bluetooth pairing</li>
        </ol>
      </li>
      <li>Second branch
        <ol>
          <li>Collect logs</li>
          <li>Attach screenshots</li>
        </ol>
      </li>
    </ol>
  </li>
</ol>
`

export const DeepNestedOrderedReset: Story = {
    args: {
        oldTitle: 'Troubleshooting guide',
        newTitle: 'Troubleshooting guide',
        oldContent: oldDeepNestedResetContent,
        newContent: newDeepNestedResetContent,
    },
}

const oldMixedRichContent = `
<p>Before handling returns, review the policy at <a href="https://example.com/policy">example.com/policy</a>.</p>
<ul>
  <li>Ask for order number</li>
  <li>Ask for email</li>
</ul>
<p>Use code <code>RETURN_LEGACY</code> for legacy orders.</p>
`

const newMixedRichContent = `
<p>Before handling returns, review the policy at <a href="https://example.com/policy-v2">example.com/policy-v2</a> and confirm warranty terms.</p>
<ul>
  <li>Ask for order number</li>
  <li>Ask for email and shipping address</li>
  <li>Ask for delivery date</li>
</ul>
<p>Use code <code>RETURN_V2</code> for legacy orders.</p>
`

export const MixedRichContentDiff: Story = {
    args: {
        oldTitle: 'Return policy',
        newTitle: 'Return policy v2',
        oldContent: oldMixedRichContent,
        newContent: newMixedRichContent,
    },
}

const smileEmoji = String.fromCodePoint(0x1f604)
const sweatSmileEmoji = String.fromCodePoint(0x1f605)

const oldEmojiRegressionContent = `
<p>Escalation summary ${smileEmoji}</p>
<ul>
  <li>Check customer context</li>
  <li>Confirm delivery date</li>
</ul>
`

const newEmojiRegressionContent = `
<p>Escalation summary ${sweatSmileEmoji}</p>
<ul>
  <li>Check customer context</li>
  <li>Confirm delivery date and timezone</li>
</ul>
`

export const EmojiDiffRegression: Story = {
    args: {
        oldTitle: 'Emoji regression',
        newTitle: 'Emoji regression updated',
        oldContent: oldEmojiRegressionContent,
        newContent: newEmojiRegressionContent,
    },
}

const oldPublishedBreakLineRegressionContent = `<div>Vlad Test Drafts pt.2 hola, is this a great user  experience?ubiubiubu</div><div><br /></div><div>Now it is time to add some actions and variables.$$$01HWACSKEC868PRZ47TY5K5F0X$$$</div><div><br /></div><div>&&&customer.orders_count&&&$$$01JA8XAW0G7T5Y1AETJRPPPPQN$$$</div><div><br /></div><ul><li>And <strong>now I can also add some bolds and some italic: </strong><em>hello world, </em>${smileEmoji}</li><li><a href="https://google.com/" target="_blank">google</a></li><li>another edit</li></ul><figure style="display:inline-block;margin:0"><hr /></figure><div><br /></div>`

const newDraftBreakLineRegressionContent = `<div>Vlad Test Drafts pt.2 hola, is this a great user experience?ubiubiubu</div><div>Now it is time to add some actions and variables.$$$01HWACSKEC868PRZ47TY5K5F0X$$$</div><div><br /></div><div>&&&customer.orders_count&&&$$$01JA8XAW0G7T5Y1AETJRPPPPQN$$$</div><div><br /></div><ul><li>And <strong>now I can also add some bolds and some italic: </strong><em>hello world, </em>${sweatSmileEmoji}</li><li><a href="https://google.com/" target="_blank">google</a></li><li>another edit updated</li></ul><figure style="display:inline-block;margin:0"><hr /></figure><div><br /></div><div>Do not share the available products with the customer or the computation logic.</div>`

export const PublishedVsDraftBreakLineRegression: Story = {
    args: {
        oldTitle: 'Published version with break lines',
        newTitle: 'Draft version with line break updates',
        oldContent: oldPublishedBreakLineRegressionContent,
        newContent: newDraftBreakLineRegressionContent,
    },
}

const oldPublishedNbspBreakLineContent = `
<p>Vlad Test Drafts pt.2 hola, is this a great user experience?ubiubiubu</p>
<p>&nbsp;</p>
<p>Now it is time to add some actions and variables.$$$01HWACSKEC868PRZ47TY5K5F0X$$$</p>
<p>&nbsp;</p>
<p>&&&customer.orders_count&&&$$$01JA8XAW0G7T5Y1AETJRPPPPQN$$$</p>
<p>&nbsp;</p>
<ul>
  <li>And <strong>now I can also add some bolds and some italic: </strong><em>hello world, </em>${smileEmoji}</li>
  <li><a href="https://google.com/" target="_blank">google</a></li>
  <li>another edit</li>
</ul>
`

const newDraftNbspBreakLineContent = `
<p>Vlad Test Drafts pt.2 hola, is this a great user experience?ubiubiubu</p>
<p>Now it is time to add some actions and variables.$$$01HWACSKEC868PRZ47TY5K5F0X$$$</p>
<p>&nbsp;</p>
<p>&&&customer.orders_count&&&$$$01JA8XAW0G7T5Y1AETJRPPPPQN$$$</p>
<p>&nbsp;</p>
<ul>
  <li>And <strong>now I can also add some bolds and some italic: </strong><em>hello world, </em>${sweatSmileEmoji}</li>
  <li><a href="https://google.com/" target="_blank">google</a></li>
  <li>another edit updated</li>
</ul>
`

export const PublishedVsDraftNbspBreakLineRegression: Story = {
    args: {
        oldTitle: 'Published with nbsp line breaks',
        newTitle: 'Draft without one line break',
        oldContent: oldPublishedNbspBreakLineContent,
        newContent: newDraftNbspBreakLineContent,
    },
}
