import axios from 'axios'
import { ref } from 'vue'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
  }
})

export function useApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const get = async <T>(url: string): Promise<T> => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(url)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const post = async <T>(url: string, data: any): Promise<T> => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(url, data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const put = async <T>(url: string, data: any): Promise<T> => {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(url, data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const del = async <T>(url: string): Promise<T> => {
    loading.value = true
    error.value = null
    try {
      const response = await api.delete(url)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return { get, post, put, del, loading, error }
}
