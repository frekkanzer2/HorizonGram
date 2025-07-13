exports.limitedConcurrency = async (tasks, limit) => {
    const results = [];
    const executing = [];
    let completedTasks = 0;
    const totalTasks = tasks.length;
    for (const task of tasks) {
        const p = task();
        results.push(p);
        const e = p.finally(() => {
            executing.splice(executing.indexOf(e), 1);
            completedTasks++;
        });
        executing.push(e);
        if (executing.length >= limit) {
            await Promise.race(executing);
        }
    }
    await Promise.all(results);
};
