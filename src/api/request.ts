import { ref, type Ref } from "vue";

import { type ReturnData } from "@/model/dto/ReturnData";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export interface RequestResult<T> {
  data: Ref<T | undefined>;
  isLoading: Ref<boolean>;
  err: Ref<string>;
}

async function useRequest<T>(
  url: string,
  requestInit: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  },
  tokenIsNeeded: boolean = true
): Promise<RequestResult<T>> {
  const data: Ref<T | undefined> = ref<T>();
  const isLoading = ref(true);
  const err = ref("");
  if (tokenIsNeeded) {
    // 获取token的操作
    // ...
    const token = localStorage.getItem("token");
    const headers = new Headers(requestInit.headers ?? {});
    headers.set("Authorization", `Bearer ${token}`);
    requestInit.headers = headers;
  }
  try {
    const response = await fetch(apiBaseUrl + url, requestInit);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData: ReturnData<T> = await response.json();
    if (jsonData.code >= 200 && jsonData.code < 300) {
      data.value = jsonData.data;
    } else {
      throw new Error(jsonData.message);
    }
  } catch (e) {
    if (e instanceof Error) {
      err.value = e.message;
    } else {
      err.value = "未知错误";
    }
  } finally {
    isLoading.value = false;
  }
  return { data, isLoading, err };
}

export { useRequest };
