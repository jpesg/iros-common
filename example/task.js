const run = () => new Promise((resolve, reject) => {
  try {
    setTimeout(() => {
      resolve();
    }, 3000 + Math.round(Math.random() * 1000));
  } catch (e) {
    reject(e);
  }
});

export default {run};