exports.limitedConcurrency = async (tasks, limit) => {
    const results = [];
    const executing = [];
    for (const task of tasks) {
        const p = task();
        results.push(p);
        if (limit <= tasks.length) {
            const e = p.finally(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }

    return Promise.all(results);
}