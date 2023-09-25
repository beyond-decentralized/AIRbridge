const pushState = history.pushState
history.pushState = (state, ...args) => {
    console.log(`FORWARD: ${args[1]}`)
    // // forward navigation
    // if (typeof (history as any).onpushstate == "function") {
    //     (history as any).onpushstate({ state: state });
    // }
    pushState.call(history, state, ...args)

    // if (currentPath === args[1]) {
    //     return
    // }
    // currentPath = args[1].toString()
    // request.newUrl = location.href
    // try {
    //     apiClient.sendMessage(request)
    // } catch (e) {
    //     console.error(e)
    // }
}

window.addEventListener("popstate", (event) => {
    console.log(
        `BACK: location: ${document.location}, state: ${JSON.stringify(event.state)}`,
    );
});

window.addEventListener('nav::user_asked_history', function (e) {
    console.log('nav::direction=', (e as any).detail.direction);
})