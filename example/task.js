const run = () => new Promise((resolve, reject) => {
  try {
    setTimeout(() => {
      resolve();
    }, 500);
  } catch (e) {
    reject(e);
  }
});

export default {run};