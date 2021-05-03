function getText() {
    return new Promise((resolve, reject) => {
        setTimeout(resolve.bind(null, 'Hello World!' + new Date()), 1000);
    });
}

(async function () {
    let text;
    try {
        text = await getText();
    } catch (e) {
        text = 'no text';
    }
    $widget.setTimeline({
        render: (ctx) => {
            console.log(ctx);
            return {
                type: 'text',
                props: {
                    text: text,
                },
            };
        },
    });
})();
