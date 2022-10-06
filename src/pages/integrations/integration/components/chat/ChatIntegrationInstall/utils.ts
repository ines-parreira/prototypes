import {Map} from 'immutable'

export const renderChatCodeSnippet = (integration: Map<any, any>) => {
    return `<!-- Gorgias Chat Widget Start -->
<div id="gorgias-chat">
<script>window.gorgiasChatParameters = {}</script>
<script src="${
        integration.getIn(['meta', 'script_url']) as string
    }" defer></script>
</div>
<!-- Gorgias Chat Widget End -->`
}
