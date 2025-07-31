import React from 'react'

import { renderHook } from '@repo/testing'

import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'

import useOrdersPagePreview from '../useOrdersPagePreview'

describe('useOrdersPagePreview', () => {
    it('should return preview steps', () => {
        const { result } = renderHook(() => useOrdersPagePreview(), {
            wrapper: ({ children }) => (
                <SelfServicePreviewContext.Provider
                    value={{
                        reportOrderIssueReason: {
                            reasonKey: 'reasonKey',
                            action: {
                                responseMessageContent: {
                                    html: 'html',
                                    text: 'text',
                                },
                                type: 'automated_response',
                                showHelpfulPrompt: true,
                            },
                        },
                    }}
                >
                    {children}
                </SelfServicePreviewContext.Provider>
            ),
        })

        expect(result.current).toEqual({
            previewStep: 0,
        })
    })
})
