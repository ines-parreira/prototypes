import {
    AtomicBlockUtils,
    ContentState,
    convertFromRaw,
    convertToRaw,
    EditorState,
    Modifier,
} from 'draft-js'

import {convertFromHTML, convertToHTML, VIDEO_TYPE} from '../utils'

let mockDeterministicKey = 0
jest.mock('draft-js/lib/generateRandomKey', () => {
    return () => mockDeterministicKey++
})
beforeEach(() => {
    mockDeterministicKey = 0
})

describe('convertFromHTML', () => {
    it('should understand videos', () => {
        expect(
            convertToRaw(
                convertFromHTML(
                    '<iframe width="630" height="394" src="https://www.loom.com/embed/f847480edb844e28b124927d3152546b" frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe>'
                )
            )
        ).toMatchInlineSnapshot(`
            Object {
              "blocks": Array [
                Object {
                  "data": Object {},
                  "depth": 0,
                  "entityRanges": Array [
                    Object {
                      "key": 0,
                      "length": 1,
                      "offset": 0,
                    },
                  ],
                  "inlineStyleRanges": Array [],
                  "key": 1,
                  "text": "a",
                  "type": "atomic",
                },
              ],
              "entityMap": Object {
                "0": Object {
                  "data": Object {
                    "height": 394,
                    "src": "https://www.loom.com/embed/f847480edb844e28b124927d3152546b",
                    "width": 630,
                  },
                  "mutability": "IMMUTABLE",
                  "type": "VIDEO",
                },
              },
            }
        `)
    })
    it('should understand images', () => {
        expect(
            convertToRaw(
                convertFromHTML(
                    '<img src="https://files.helpdocs.io/eQ5bRgGfSN/articles/bb8qfbt1mj/1588598197230/image.png" />'
                )
            )
        ).toMatchInlineSnapshot(`
            Object {
              "blocks": Array [
                Object {
                  "data": Object {},
                  "depth": 0,
                  "entityRanges": Array [
                    Object {
                      "key": 0,
                      "length": 1,
                      "offset": 0,
                    },
                  ],
                  "inlineStyleRanges": Array [],
                  "key": 1,
                  "text": "a",
                  "type": "atomic",
                },
              ],
              "entityMap": Object {
                "0": Object {
                  "data": Object {
                    "src": "https://files.helpdocs.io/eQ5bRgGfSN/articles/bb8qfbt1mj/1588598197230/image.png",
                  },
                  "mutability": "MUTABLE",
                  "type": "IMAGE",
                },
              },
            }
        `)
    })
    it('should understand images in figure', () => {
        expect(
            convertToRaw(
                convertFromHTML(
                    '<figure><img src="https://files.helpdocs.io/eQ5bRgGfSN/articles/bb8qfbt1mj/1588598197230/image.png" /></figure>'
                )
            )
        ).toMatchInlineSnapshot(`
            Object {
              "blocks": Array [
                Object {
                  "data": Object {},
                  "depth": 0,
                  "entityRanges": Array [
                    Object {
                      "key": 0,
                      "length": 1,
                      "offset": 0,
                    },
                  ],
                  "inlineStyleRanges": Array [],
                  "key": 1,
                  "text": "a",
                  "type": "atomic",
                },
              ],
              "entityMap": Object {
                "0": Object {
                  "data": Object {
                    "src": "https://files.helpdocs.io/eQ5bRgGfSN/articles/bb8qfbt1mj/1588598197230/image.png",
                  },
                  "mutability": "MUTABLE",
                  "type": "IMAGE",
                },
              },
            }
        `)
    })
    it('should understand links', () => {
        expect(
            convertToRaw(
                convertFromHTML(
                    `<p>Liking an Instagram comment using Gorgias isn&#39;t an option just yet. However, you can like <a
      href="https://docs.gorgias.com/facebook-messenger/facebook-comments#facebook_comment_reactions"
      target="_blank">Facebook comments</a>!</p>`
                )
            )
        ).toMatchInlineSnapshot(`
            Object {
              "blocks": Array [
                Object {
                  "data": Object {},
                  "depth": 0,
                  "entityRanges": Array [
                    Object {
                      "key": 0,
                      "length": 17,
                      "offset": 90,
                    },
                  ],
                  "inlineStyleRanges": Array [],
                  "key": 1,
                  "text": "Liking an Instagram comment using Gorgias isn't an option just yet. However, you can like Facebook comments!",
                  "type": "unstyled",
                },
              ],
              "entityMap": Object {
                "0": Object {
                  "data": Object {
                    "url": "https://docs.gorgias.com/facebook-messenger/facebook-comments#facebook_comment_reactions",
                  },
                  "mutability": "MUTABLE",
                  "type": "LINK",
                },
              },
            }
        `)
    })
    it('should understand code blocks', () => {
        expect(convertToRaw(convertFromHTML('<pre>code</pre>')))
            .toMatchInlineSnapshot(`
            Object {
              "blocks": Array [
                Object {
                  "data": Object {},
                  "depth": 0,
                  "entityRanges": Array [
                    Object {
                      "key": 0,
                      "length": 4,
                      "offset": 0,
                    },
                  ],
                  "inlineStyleRanges": Array [],
                  "key": 1,
                  "text": "code",
                  "type": "atomic",
                },
              ],
              "entityMap": Object {
                "0": Object {
                  "data": Object {
                    "code": "code",
                  },
                  "mutability": "MUTABLE",
                  "type": "CODE_BLOCK",
                },
              },
            }
        `)
    })
    it('should understand iframe as INJECTED_HTML', () => {
        expect(
            convertToRaw(
                convertFromHTML(
                    `<iframe width="630" height="394"
    src="https://www.loom.com/not-a-video" frameborder="0" webkitallowfullscreen=""
    mozallowfullscreen="" allowfullscreen=""></iframe>`
                )
            )
        ).toMatchInlineSnapshot(`
            Object {
              "blocks": Array [
                Object {
                  "data": Object {},
                  "depth": 0,
                  "entityRanges": Array [
                    Object {
                      "key": 0,
                      "length": 1,
                      "offset": 0,
                    },
                  ],
                  "inlineStyleRanges": Array [],
                  "key": 1,
                  "text": "a",
                  "type": "atomic",
                },
              ],
              "entityMap": Object {
                "0": Object {
                  "data": Object {
                    "src": "<iframe width=\\"630\\" height=\\"394\\" src=\\"https://www.loom.com/not-a-video\\" frameborder=\\"0\\" webkitallowfullscreen=\\"\\" mozallowfullscreen=\\"\\" allowfullscreen=\\"\\"></iframe>",
                  },
                  "mutability": "MUTABLE",
                  "type": "INJECTED_HTML",
                },
              },
            }
        `)
    })
    it('should understand iframes in divs as INJECTED_HTML (helpdoc)', () => {
        expect(
            convertToRaw(
                convertFromHTML(
                    `<div class="hd--embed" data-provider="Loom" data-thumbnail=""><iframe width="630" height="394"
    src="https://www.loom.com/not-a-video" frameborder="0" webkitallowfullscreen=""
    mozallowfullscreen="" allowfullscreen=""></iframe></div>`
                )
            )
        ).toMatchInlineSnapshot(`
            Object {
              "blocks": Array [
                Object {
                  "data": Object {},
                  "depth": 0,
                  "entityRanges": Array [
                    Object {
                      "key": 0,
                      "length": 1,
                      "offset": 0,
                    },
                  ],
                  "inlineStyleRanges": Array [],
                  "key": 1,
                  "text": "a",
                  "type": "atomic",
                },
              ],
              "entityMap": Object {
                "0": Object {
                  "data": Object {
                    "src": "<iframe width=\\"630\\" height=\\"394\\" src=\\"https://www.loom.com/not-a-video\\" frameborder=\\"0\\" webkitallowfullscreen=\\"\\" mozallowfullscreen=\\"\\" allowfullscreen=\\"\\"></iframe>",
                  },
                  "mutability": "MUTABLE",
                  "type": "INJECTED_HTML",
                },
              },
            }
        `)
    })
    it('should understand random bytes of HTML', () => {
        expect(
            convertToRaw(
                convertFromHTML(
                    `
                    <p>Fooo</p>
                    <table>
                      <tr>
                        <td>Emil</td>
                        <td>Tobias</td>
                        <td>Linus</td>
                      </tr>
                    </table>`
                )
            )
        ).toMatchInlineSnapshot(`
            Object {
              "blocks": Array [
                Object {
                  "data": Object {},
                  "depth": 0,
                  "entityRanges": Array [],
                  "inlineStyleRanges": Array [],
                  "key": 1,
                  "text": "Fooo",
                  "type": "unstyled",
                },
                Object {
                  "data": Object {},
                  "depth": 0,
                  "entityRanges": Array [
                    Object {
                      "key": 0,
                      "length": 1,
                      "offset": 0,
                    },
                  ],
                  "inlineStyleRanges": Array [],
                  "key": 2,
                  "text": "a",
                  "type": "atomic",
                },
              ],
              "entityMap": Object {
                "0": Object {
                  "data": Object {
                    "src": "<table>
                                  <tbody><tr>
                                    <td>Emil</td>
                                    <td>Tobias</td>
                                    <td>Linus</td>
                                  </tr>
                                </tbody></table>",
                  },
                  "mutability": "MUTABLE",
                  "type": "INJECTED_HTML",
                },
              },
            }
        `)
    })
    it('should understand style', () => {
        expect(
            convertToRaw(
                convertFromHTML(
                    `<span style="color: #ff0000">This is a red text</span>`
                )
            )
        ).toMatchInlineSnapshot(`
                      Object {
                        "blocks": Array [
                          Object {
                            "data": Object {},
                            "depth": 0,
                            "entityRanges": Array [],
                            "inlineStyleRanges": Array [
                              Object {
                                "length": 18,
                                "offset": 0,
                                "style": "color-rgb(255, 0, 0)",
                              },
                            ],
                            "key": 1,
                            "text": "This is a red text",
                            "type": "unstyled",
                          },
                        ],
                        "entityMap": Object {},
                      }
              `)
    })
})

const createDraftContentAndInsertEntity = (
    type: string,
    data: Record<string, unknown>
): ContentState => {
    const editorState = EditorState.createEmpty()
    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
        type,
        'IMMUTABLE',
        data
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const contentStateWithLink = Modifier.applyEntity(
        contentStateWithEntity,
        EditorState.moveFocusToEnd(editorState).getSelection(),
        entityKey
    )
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        EditorState.set(editorState, {
            currentContent: contentStateWithLink,
        }),
        entityKey,
        ' '
    )
    return newEditorState.getCurrentContent()
}

const createContentFromRaw = (): ContentState => {
    const content = convertFromRaw({
        blocks: [
            {
                data: {},
                depth: 0,
                entityRanges: [],
                inlineStyleRanges: [
                    {
                        length: 18,
                        offset: 0,
                        //@ts-ignore typing of style
                        style: 'color-#ff0000',
                    },
                ],
                key: '1',
                text: 'This is a red text',
                type: 'unstyled',
            },
        ],
        entityMap: {},
    })
    const editorState = EditorState.createWithContent(content)
    return editorState.getCurrentContent()
}

describe('convertToHTML', () => {
    it('should convert video', () => {
        expect(
            convertToHTML(
                createDraftContentAndInsertEntity(VIDEO_TYPE, {
                    src: 'https://www.youtube.com/embed/E4t0mTFjNss',
                    width: 500,
                    height: 281,
                })
            )
        ).toMatchInlineSnapshot(`
            "<p></p><figure>
                                <iframe width=500 height=281 src=\\"https://www.youtube.com/embed/E4t0mTFjNss\\" frameborder=\\"0\\" allowfullscreen></iframe>
                            </figure><p></p>"
        `)
    })
    it('should convert images', () => {
        expect(
            convertToHTML(
                createDraftContentAndInsertEntity('IMAGE', {
                    src:
                        'https://files.helpdocs.io/eQ5bRgGfSN/articles/bb8qfbt1mj/1588598197230/image.png',
                })
            )
        ).toMatchInlineSnapshot(
            `"<p></p><figure><img src=\\"https://files.helpdocs.io/eQ5bRgGfSN/articles/bb8qfbt1mj/1588598197230/image.png\\" /></figure><p></p>"`
        )
    })
    it('should convert code blocks', () => {
        expect(
            convertToHTML(
                convertFromRaw({
                    entityMap: {},
                    blocks: [
                        {
                            key: 'foo',
                            text: 'code',
                            type: 'code',
                            depth: 0,
                            inlineStyleRanges: [],
                            entityRanges: [],
                        },
                    ],
                })
            )
        ).toMatchInlineSnapshot(`"<pre>code</pre>"`)
    })
    it('should convert raw HTML blocks', () => {
        expect(
            convertToHTML(
                createDraftContentAndInsertEntity('INJECTED_HTML', {
                    src:
                        '<iframe width="630" height="394" src="https://www.loom.com/embed/f847480edb844e28b124927d3152546b" frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe>',
                })
            )
        ).toMatchInlineSnapshot(
            `"<p></p><div data-widgetType=\\"injected-html\\"><iframe width=\\"630\\" height=\\"394\\" src=\\"https://www.loom.com/embed/f847480edb844e28b124927d3152546b\\" frameborder=\\"0\\" webkitallowfullscreen=\\"\\" mozallowfullscreen=\\"\\" allowfullscreen=\\"\\"></iframe></div><p></p>"`
        )

        expect(
            convertToHTML(
                createDraftContentAndInsertEntity('INJECTED_HTML', {
                    src: `<div><script>console.log('injected2')</script></div>`,
                })
            )
        ).toMatchInlineSnapshot(
            `"<p></p><div data-widgetType=\\"injected-html\\"><div><script>console.log('injected2')</script></div></div><p></p>"`
        )

        expect(
            convertToHTML(
                createDraftContentAndInsertEntity('INJECTED_HTML', {
                    src: `
                  <table>
                    <tr>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Country</th>
                    </tr>
                    <tr>
                      <td>Alfreds Futterkiste</td>
                      <td>Maria Anders</td>
                      <td>Germany</td>
                    </tr>
                    <tr>
                      <td>Centro comercial Moctezuma</td>
                      <td>Francisco Chang</td>
                      <td>Mexico</td>
                    </tr>
                  </table>
                  `,
                })
            )
        ).toMatchInlineSnapshot(`
            "<p></p><div data-widgetType=\\"injected-html\\">
                              <table>
                                <tr>
                                  <th>Company</th>
                                  <th>Contact</th>
                                  <th>Country</th>
                                </tr>
                                <tr>
                                  <td>Alfreds Futterkiste</td>
                                  <td>Maria Anders</td>
                                  <td>Germany</td>
                                </tr>
                                <tr>
                                  <td>Centro comercial Moctezuma</td>
                                  <td>Francisco Chang</td>
                                  <td>Mexico</td>
                                </tr>
                              </table>
                              </div><p></p>"
        `)
    })
    it('should convert styling', () => {
        expect(convertToHTML(createContentFromRaw())).toMatchInlineSnapshot(
            `"<p><span style=\\"color: #ff0000\\">This is a red text</span></p>"`
        )
    })
})
