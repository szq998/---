const weiboHotURL = 'https://s.weibo.com/top/summary';
const hotItemRegex = /<tr.*?>.*?<a.*?>(.+?)<\/a>.*?<\/tr>/gs;

async function getWeiboHot() {
    const { error, data: hotHtml } = await $http.get({ url: weiboHotURL });
    if (error) {
        throw error;
    }
    if (!hotHtml || typeof hotHtml !== 'string') {
        throw new Error(`No readable data from ${weiboHotURL}`);
    }
    return [...hotHtml.matchAll(hotItemRegex)].map((item) => item[1]);
}

module.exports = getWeiboHot;
