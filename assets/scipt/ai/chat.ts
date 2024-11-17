export const request = <T>(
  url: string,
  method: "GET" | "POST",
  data?: any
): Promise<T> => {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options)
    .then((res) => {
      if (res.ok) {
        return res.json() as Promise<T>;
      }

      throw new Error(res.statusText);
    })
    .catch((err) => {
      console.error(`网络错误: ${err}`);
      throw err;
    });
};

export const get = <T>(url: string): Promise<T> => request<T>(url, "GET");

export const post = <T>(url: string, data: any): Promise<T> =>
  request<T>(url, "POST", data);
