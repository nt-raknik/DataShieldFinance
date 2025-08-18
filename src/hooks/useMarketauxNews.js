
import { useEffect, useState } from 'react'
import { fetchNewsMX } from '../services/marketaux'
import { DUMMY_NEWS_MX } from '../services/dummy'

export function useMarketauxNews(opts) {
  const [state, setState] = useState({ loading: true, error: null, news: [] })
  useEffect(() => {
    let abort = false
    async function run() {
      try {
        const res = await fetchNewsMX(opts)
        if (abort) return
        if (!res.ok) {
          setState({ loading: false, error: res.reason || 'Error', news: DUMMY_NEWS_MX })
          return
        }
        setState({ loading: false, error: null, news: res.data.length ? res.data : DUMMY_NEWS_MX })
      } catch (e) {
        if (!abort) setState({ loading: false, error: String(e?.message || e), news: DUMMY_NEWS_MX })
      }
    }
    run()
    return () => { abort = true }
  }, [JSON.stringify(opts||{})])
  return state
}
