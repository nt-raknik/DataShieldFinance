"use strict";

// We use Finnhub for most features
//import finnhub from "finnhub"
const finnhub = require("finnhub");
//import finnhub from "finnhub"
// // use dotenv to load the API Key from a .env file
//import * as dotenv from "dotenv"
const dotenv = require("dotenv");
//import "dotenv/config"
dotenv.config();

const finnhubClient = new finnhub.DefaultApi(process.env.FINNHUB_API_KEY); // API KEY

function asPromiseAPI(callback) {
    return new Promise((resolve, reject) => {
        callback((error, data, response) => {
            if (error) reject(error)
            else resolve(data)
        })
    })
}
const API_KEY = process.env.VITE_MARKETAUX_API_KEY;

function parseMarketauxResponse(json) {
  if (!json || !Array.isArray(json.data)) return []
  return json.data
    .map((item) => ({
      title: item?.title ?? '(sin título)',
      url: item?.url ?? '#',
      source: (item?.source && (item.source.name || item.source)) || 'Fuente',
      published_at: item?.published_at || null,
    }))
    .filter((x) => !!x.title && !!x.url)
}

 async function fetchNewsMX({ countries = 'mx', language = 'es', limit = 6 } = {}) {
  if (!API_KEY) return { ok: false, reason: 'NO_KEY' }
  const url = new URL('https://api.marketaux.com/v1/news/all')
  url.search = new URLSearchParams({ api_token: API_KEY, countries, language, limit: String(limit) }).toString()
  const res = await fetch(url.toString())
  if (!res.ok) return { ok: false, reason: 'HTTP_' + res.status }
  const json = await res.json()
  const normalized = parseMarketauxResponse(json)
  return { ok: true, data: normalized }
}

 function noticias() {
    return fetchNewsMX();
}

 function quote(symbol) {
    return asPromiseAPI(finnhubClient.quote.bind(finnhubClient, symbol))
}

 function companyBasicFinancials(symbol, metric) {
    return asPromiseAPI(finnhubClient.companyBasicFinancials.bind(finnhubClient, symbol, metric))
}

 function companyEarnings(symbol, options) {
    return asPromiseAPI(finnhubClient.companyEarnings.bind(finnhubClient, symbol, options))
}

 function companyProfile2(options) {
    return asPromiseAPI(finnhubClient.companyProfile2.bind(finnhubClient, options))
}

 function country() {
    return asPromiseAPI(finnhubClient.country.bind(finnhubClient))
}

 function earningsCalendar(options) {
    return asPromiseAPI(finnhubClient.earningsCalendar.bind(finnhubClient, options))
}

 function filings(options) {
    return asPromiseAPI(finnhubClient.filings.bind(finnhubClient, options))
}

 function financialsReported(options) {
    return asPromiseAPI(finnhubClient.financialsReported.bind(finnhubClient, options))
}

 function marketNews(category, options) {
    return asPromiseAPI(finnhubClient.marketNews.bind(finnhubClient, category, options))
}

 function recommendationTrends(symbol) {
    return asPromiseAPI(finnhubClient.recommendationTrends.bind(finnhubClient, symbol))
}

//--------------------------------------------

// Use AlphaVantage for Historic Quote Data
 async function getTimeSeriesDaily(symbol) {
    return (await fetch(`http://alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHAVANTAGE_API_KEY}`)).json()
}

module.exports = { noticias, marketNews};