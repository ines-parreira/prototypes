import React from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { KnowledgeEditorGuidanceDiffView } from './KnowledgeEditorGuidanceDiffView'

const meta: Meta<typeof KnowledgeEditorGuidanceDiffView> = {
    title: 'AI Agent/Knowledge/KnowledgeEditor/KnowledgeEditorGuidanceDiffView',
    component: KnowledgeEditorGuidanceDiffView,
}

export default meta

type Story = StoryObj<typeof KnowledgeEditorGuidanceDiffView>

const oldContent = `
<ol>
  <li>Intro item</li>
  <li>Main item
    <ol>
      <li>Nested first
        <ol>
          <li>Deep item one</li>
          <li>Deep item two</li>
        </ol>
      </li>
      <li>Nested second</li>
    </ol>
  </li>
</ol>
`

const newContent = `
<ol>
  <li>Intro item</li>
  <li>Main item updated
    <ol>
      <li>Nested first
        <ol>
          <li>Deep item one updated</li>
          <li>Deep item two</li>
        </ol>
      </li>
      <li>Nested second</li>
      <li>Nested third</li>
    </ol>
  </li>
</ol>
`

export const NestedOrderedLists: Story = {
    args: {
        oldTitle: 'Knowledge guidance title',
        newTitle: 'Knowledge guidance title updated',
        oldContent,
        newContent,
    },
}

const oldUnorderedContent = `
<ul>
  <li>Cash bands</li>
  <li>Charging Cable / Charging cord / Charger only for Finder Card</li>
  <li>Backpack straps</li>
</ul>
`

const newUnorderedContent = `
<ul>
  <li>Cash bands</li>
  <li>Charging Cable / Charging cord / Charger only for Finder Card - Android or Apple (not for Finder for MagSafe)</li>
  <li>Backpack straps</li>
</ul>
`

export const UnorderedListDiff: Story = {
    args: {
        oldTitle: 'Included accessories',
        newTitle: 'Included accessories',
        oldContent: oldUnorderedContent,
        newContent: newUnorderedContent,
    },
}

const oldNestedResetContent = `
<ol>
  <li><strong>Verify the Order:</strong>
    <ol>
      <li>If no associated order is found for the provided email address, ask the shopper for their order number.</li>
      <li><strong>If an order is found:</strong>
        <ol>
          <li>Confirm the order number and compute the days since delivery:
            <ol>
              <li><strong>Order is within the warranty window</strong>
                <ol>
                  <li>Confirm to the shopper that if we have spare parts available, a replacement will be provided at no cost.</li>
                  <li>Handover the ticket to the team.</li>
                </ol>
              </li>
              <li><strong>Order falls outside of the warranty window</strong>
                <ol>
                  <li>Confirm to the shopper that if we have spare parts available, a replacement can be provided at a small charge.</li>
                  <li>Handover the ticket to the team.</li>
                </ol>
              </li>
            </ol>
          </li>
        </ol>
      </li>
    </ol>
  </li>
</ol>
`

const newNestedResetContent = `
<ol>
  <li><strong>Verify the Order:</strong>
    <ol>
      <li>If no associated order is found for the provided email address, ask the shopper for their order number and email address and hand over the ticket to the team.</li>
      <li><strong>If an order is found:</strong>
        <ol>
          <li>Confirm the order number and compute the days since delivery and the ticket creation date:
            <ol>
              <li><strong>Order is within the warranty window</strong>
                <ol>
                  <li>Confirm to the shopper that if we have spare parts available, a new product part will be provided to them at no cost.</li>
                  <li>Handover the ticket to the team.</li>
                </ol>
              </li>
              <li><strong>Order falls outside of the warranty window</strong>
                <ol>
                  <li>Confirm to the shopper that if we have spare parts available, a new product part will be provided to them at a small charge.</li>
                  <li>Handover the ticket to the team.</li>
                </ol>
              </li>
            </ol>
          </li>
        </ol>
      </li>
    </ol>
  </li>
</ol>
`

export const NestedOrderedListReset: Story = {
    args: {
        oldTitle: 'Warranty checks',
        newTitle: 'Warranty checks',
        oldContent: oldNestedResetContent,
        newContent: newNestedResetContent,
    },
}

const oldEksterContent = `<p id="isPasted">If a customer requires a spare part for their product, and the product is within the warranty window, a new product part will be provided to them. If the product falls outside of the warranty, we will be able to ship them out a replacement part at a small charge.</p><p>&nbsp;</p><p id="isPasted">The only spare parts available that we have are:</p><p>- Cash bands</p><p>- Finder Card Charging Cable /Charging cord / Charger</p><p>- Backpack straps</p>`

const newEksterContent = `<div><u>If a customer requires a spare part for their product:</u></div><ul><li>Cash bands</li><li>Charging Cable / Charging cord / Charger only for Finder Card - Android or Apple (not for Finder for MagSafe)</li><li>Backpack straps</li></ul><ol><li><strong>Verify the Order:</strong></li><ol><li>If no associated order is found for the provided email address, <strong>ask the shopper for their order number</strong> and email <strong>address and hand over the ticket to the team.</strong></li><li><strong>If an order is found:</strong></li><ol><li>Confirm the order number and compute the days since the order was delivered and the ticket creation date:</li><ol><li><strong>Order is within the warranty window </strong></li><ol><li>Confirm to the shopper that if we have spare parts available, a new product part will be provided to them at no cost</li><li>Handover the ticket to the team</li></ol><li><strong>Order falls outside of the warranty window</strong></li><ol><li>Confirm to the shopper that if we have spare parts available, a new product part will be provided to them at a small charge</li><li>Handover the ticket to the team</li></ol></ol></ol></ol></ol><div> 2- If the issue cannot be solved with one of these spare parts, then link them to our Warranty Portal: <a href="http://returns.ekster.com/" target="_blank">returns.ekster.com</a></div><div><br /></div><div>Do not share the available products with the customer or the computation logic.</div>`

export const EksterCase: Story = {
    args: {
        oldTitle: 'Spare parts guidance',
        newTitle: 'Spare parts guidance',
        oldContent: oldEksterContent,
        newContent: newEksterContent,
    },
}

const smileEmoji = String.fromCodePoint(0x1f604)
const sweatSmileEmoji = String.fromCodePoint(0x1f605)

const oldEmojiBreakLineGuidanceContent = `
<p>Escalation summary ${smileEmoji}</p>
<p>&nbsp;</p>
<ul>
  <li>Collect logs</li>
  <li>Attach screenshots</li>
</ul>
`

const newEmojiBreakLineGuidanceContent = `
<p>Escalation summary ${sweatSmileEmoji}</p>
<ul>
  <li>Collect logs</li>
  <li>Attach screenshots and serial labels</li>
</ul>
`

export const EmojiAndBreakLineRegression: Story = {
    args: {
        oldTitle: 'Guidance regression check',
        newTitle: 'Guidance regression check',
        oldContent: oldEmojiBreakLineGuidanceContent,
        newContent: newEmojiBreakLineGuidanceContent,
    },
}
