exports.limitedConcurrency = async (tasks, limit) => {
    const results = [];
    const executing = [];
    let index = 1;
    for (const task of tasks) {
        const p = task();
        results.push(p);
        if (limit <= tasks.length) {
            const e = p.finally(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            console.log(`EXE > Executing task ${index} of ${tasks.length}`);
            index++;
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }

    return Promise.all(results);
}