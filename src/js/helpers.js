// functions that we reuse in our project
import { TIMEOUT_SEC } from './config';

// will return a new promise, will reject after certain number of seconds
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    // Promise.race takes 2 promises, and whoever first reject or fullfils wins
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    //2. we convert it to json, method available to all response objects
    const data = await res.json();

    //3. if Response.ok property === false show error
    if (!res.ok) throw new Error(`${data.message} (${res.status}) `);

    // data is resolved value of this promise
    return data;
  } catch (err) {
    // if we rethrow err promise we get from getJSON will reject and we will handle it in model
    throw err;
  }
};
