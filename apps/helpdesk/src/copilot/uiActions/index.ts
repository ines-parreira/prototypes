export {
    anchorCandidates,
    COPILOT_ANCHOR_ATTRIBUTE,
    copilotAnchorId,
    copilotAnchorProps,
} from './anchors'
export type { CopilotAnchorTarget } from './anchors'
export {
    COPILOT_HIGHLIGHT_MARKER_ATTRIBUTE,
    highlightAnchor,
} from './highlight/highlightAnchor'
export type {
    HighlightAnchorOptions,
    HighlightHandle,
    HighlightOutcome,
} from './highlight/highlightAnchor'
export { announce, clearLiveRegion, ensureLiveRegion } from './announce'
