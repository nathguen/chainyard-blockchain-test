import * as _ from 'lodash';

/**
 * @typedef HttpRequestOptions
 * @prop {Object} headers
 * @prop {string} method
 */

/**
 * @typedef HttpRequest
 * @prop {string} url
 * @prop {HttpRequestOptions} options
 * @prop {boolean} useToken
 */

interface SimHttpRequest {
  url: string
  options: RequestInit
}

export async function http({ url, options }: SimHttpRequest) {
  return fetch(url, options)
    .then(processStatus(options))
    .then(data => {
      return {
        success: _.get(data, 'ok'),
        results: _.get(data, 'body', {}),
        headers: _.get(data, 'headers', {}),
        errorData: _.get(data, 'errorData', {})
      };
    });
}

export function processStatus(fetchOptions) {
  return async (response) => {
    // make iterable object
    const responseData = _.reduce(Object.getOwnPropertyNames(Response.prototype), (obj, key) => {
      obj[key] = response[key];
      return obj;
    }, {});
    const contentType = response.headers.get('content-type');

    if (response.status >= 400) {
      let errorData;

      if (fetchOptions.method !== 'HEAD' && contentType.indexOf('json') !== -1) {
        errorData = await response.json();
      }

      return Promise.resolve({
        ..._.omit(
          responseData,
          ['body']
        ),
        message: `Failed with status code ${response.status}`,
        errorData,
      });
    }

    if (response.status === 204) {
      return Promise.resolve({ headers: response.headers, body: {}, status: response.status });
    }

    // if (fetchOptions.method !== 'HEAD' && contentType.indexOf('json') !== -1) { // @TODO fix once the correct content type is added to the header
    if (fetchOptions.method !== 'HEAD') {
      return response.json().then(body => Promise.resolve({
        ...responseData,
        body,
      }));
    }

    return Promise.resolve({
      ...responseData
    });
  };
}

/**
 * 
 * @param {string} url 
 */
export function httpGet(url) {
  return http({
    url,
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    },
  });
}

export function httpPut({ url, body = {} }) {
  return http({
    url,
    options: {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    },
  });
}

export function httpPost({ url, body = {} }) {
  return http({
    url,
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    },
  });
}

export function httpDelete({ url, body = {} }) {
  return http({
    url,
    options: {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    },
  });
}