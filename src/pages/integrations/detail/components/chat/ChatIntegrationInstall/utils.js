export const renderChatCodeSnippet = (integration) => {
    return `<!-- Gorgias Chat Widget Start -->
<div id="gorgias-chat">
<script>window.gorgiasChatParameters = {}</script>
<script src="${integration.getIn(['meta', 'script_url'])}" defer></script>
</div>
<!-- Gorgias Chat Widget End -->`
}
