/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);

    const [type, cacheName, cacheKey, cacheValue] = data.inside.splits;

    if (!d.client.cacheManager.caches[type]) {
        return d.aoiError.fnError(
            d,
            "custom",
            { inside: data.inside },
            `Cache type ${type} does not exist.`,
        );
    }

    const cache = d.client.cacheManager.caches[type][cacheName.addBrackets()];

    let value;
    try {
        value = JSON.parse(cacheValue.addBrackets());
    } catch {
        value = cacheValue.addBrackets();
    }

    cache[cache.set ? "set" : "add"](cacheKey.addBrackets().toString(), value.toString());

    return {
        code: d.util.setCode(data),
    };
};
