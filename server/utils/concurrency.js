exports.limitedConcurrency = async (tasks, limit) => {
    const results = [];
    const executing = [];
    let completedTasks = 0;
    const totalTasks = tasks.length;
    const updateProgressBar = () => {
        const progress = Math.round((completedTasks / totalTasks) * 100);
        const barLength = 50;
        const progressBar = '='.repeat(Math.round(progress / 100 * barLength)) + ' '.repeat(barLength - Math.round(progress / 100 * barLength));
        process.stdout.write(`\r[${progressBar}] ${progress}%`);
    };
    for (const task of tasks) {
        const p = task();
        results.push(p);
        const e = p.finally(() => {
            executing.splice(executing.indexOf(e), 1);
            completedTasks++;
            updateProgressBar();
        });
        executing.push(e);
        if (executing.length >= limit) {
            await Promise.race(executing);
        }
    }
    await Promise.all(results);
};
