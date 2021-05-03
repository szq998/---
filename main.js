const getWeiboHot = require('./scripts/get-weibo-hot');
const doWithTimeout = require('./scripts/do-with-timeout');

const ITEM_FONT_SIZE = 13;
const ITEM_PADDING = 2;
const ITEM_HEIGHT = ITEM_FONT_SIZE + 2 * ITEM_PADDING;

const OPEN_IN_SAFARI = $widget.inputValue === 'open-in-safari';

(async function () {
    let items = null;
    let date = null;
    try {
        items = await doWithTimeout(getWeiboHot, 10000);
        date = new Date();
        $cache.setAsync({
            key: 'data',
            value: { items, date },
        });
    } catch (e) {
        console.log(e);

        const cached = $cache.get('data');
        if (cached && cached.items && cached.date) {
            ({ items, date } = cached);
        }
    }

    const entry = {
        info: items,
        date,
    };
    $widget.setTimeline({
        entries: [entry],
        policy: { atEnd: true },
        render: (ctx) => {
            const {
                entry: { info: items, date },
                family,
                isDarkMode,
            } = ctx;

            if (date === null) {
                return {
                    type: 'zstack',
                    views: [
                        renderBackground(),
                        {
                            type: 'text',
                            props: { text: '加载中...', font: $font(35) },
                        },
                    ],
                };
            }

            const itemPerColumn = Math.floor(
                (ctx.displaySize.height - 10) / ITEM_HEIGHT
            );
            const numColumn = ctx.family === 0 ? 1 : 2;
            const link = 'https://s.weibo.com/top/summary';
            return {
                type: 'zstack',
                props: {
                    widgetURL: OPEN_IN_SAFARI
                        ? link
                        : getLinkOpenedInJSBox(link),
                },
                views: [
                    renderBackground(),
                    renderUpdatingTime(date, family, isDarkMode),
                    renderHotNews(items, itemPerColumn, numColumn),
                ],
            };
        },
    });
})();

function renderBackground() {
    return {
        type: 'gradient',
        props: {
            startPoint: $point(0, 0),
            endPoint: $point(1, 1),
            colors: [
                $color('#FFDEE9', '#1D4350'),
                $color('#B5FFFC', '#A43931'),
            ],
        },
    };
}

function renderUpdatingTime(date, family, isDarkMode) {
    const opacity = isDarkMode ? 0.2 : 0.1;
    return {
        type: 'vstack',
        views: [
            {
                type: 'text',
                props: {
                    text: '更新于',
                    opacity,
                },
            },
            {
                type: 'text',
                props: {
                    date,
                    style: $widget.dateStyle.time,
                    font: $font('bold', family === 0 ? 35 : 50),
                    opacity,
                },
            },
        ],
    };
}

function renderHotNews(items, itemPerColumn, numColumn) {
    const space = {
        type: 'spacer',
        props: { frame: { width: 10 } },
    };
    return {
        type: 'hstack',
        views: [
            space,
            ...[...Array(numColumn)].map((_, i) =>
                renderColumn(
                    items.slice(i * itemPerColumn, (i + 1) * itemPerColumn)
                )
            ),
            space,
        ],
    };
}

function renderColumn(items) {
    return {
        type: 'vstack',
        props: {
            spacing: 0, // 0 spacing，通过增大item的height来分隔，以增大点触面积
        },
        views: items.map(renderItem),
    };
}

function renderItem(item) {
    const link = `https://s.weibo.com/weibo?q=%23${encodeURIComponent(
        item
    )}%23&Refer=top`;
    return {
        type: 'text',
        props: {
            link: OPEN_IN_SAFARI ? link : getLinkOpenedInJSBox(link),
            text: item,
            font: $font(ITEM_FONT_SIZE),
            color: $color('darkGray', 'white'),
            lineLimit: 1,
            frame: {
                maxWidth: Infinity,
                height: ITEM_HEIGHT,
                alignment: $widget.alignment.leading,
            },
            minimumScaleFactor: 0.7,
        },
    };
}

function getLinkOpenedInJSBox(url) {
    const script = `$safari.open('${url}')`;
    return `jsbox://run?script=${encodeURIComponent(script)}`;
}
