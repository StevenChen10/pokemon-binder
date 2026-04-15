# TCGPlayer API Reference

All endpoints are public — no auth token required. Set these headers on every request:

```
Origin: https://www.tcgplayer.com
Referer: https://www.tcgplayer.com/
Accept: application/json
Content-Type: application/json
```

---

## Search

### Product Search

Find products by name and get their `productId`.

```
POST https://mp-search-api.tcgplayer.com/v1/search/request?q={search_term}&isList=false
```

**Request Body:**

```json
{
  "algorithm": "sales_exp_fields_boosting",
  "from": 0,
  "size": 10,
  "filters": {
    "term": {},
    "range": {},
    "match": {}
  },
  "listingSearch": {
    "filters": {
      "term": { "sellerStatus": "Live", "channelId": 0 },
      "range": { "quantity": { "gte": 1 } },
      "exclude": { "channelExclusion": 0 }
    },
    "context": { "cart": {} }
  }
}
```

| Body Param | Description |
|---|---|
| `from` | Offset for pagination |
| `size` | Number of results to return |
| `filters.term` | Filter by field (e.g. `{"productLineName": ["Pokemon"]}`) |
| `filters.range` | Filter by range (e.g. `{"marketPrice": {"gte": 1, "lte": 50}}`) |

**Response Fields (per result):**

| Field | Example |
|---|---|
| `productId` | `672434` |
| `productName` | `"Ascended Heroes Booster Pack"` |
| `productLineName` | `"Pokemon"` |
| `marketPrice` | `11.74` |
| `lowestPrice` | `5.0` |
| `setName` | `"ME: Ascended Heroes"` |
| `productUrlName` | `"Ascended Heroes Booster Pack"` |
| `productTypeName` | `"Sealed Products"` |

**Product URL:** `https://www.tcgplayer.com/product/{productId}?Language=English`

---

## Product Details

### Full Product Info

Returns all product metadata, pricing summary, and SKU info in a single call.

```
GET https://mp-search-api.tcgplayer.com/v2/product/{productId}/details
```

**Response Fields:**

| Field | Example | Description |
|---|---|---|
| `productId` | `672434` | Product ID |
| `productName` | `"Ascended Heroes Booster Pack"` | Display name |
| `productLineName` | `"Pokemon"` | Game/product line |
| `productTypeName` | `"Sealed Products"` | Product type |
| `setName` | `"ME: Ascended Heroes"` | Set name |
| `setCode` | `"ASC"` | Set abbreviation |
| `marketPrice` | `11.74` | Market price |
| `lowestPrice` | `5.0` | Lowest listed price |
| `medianPrice` | `12.5` | Median listed price |
| `lowestPriceWithShipping` | `12.75` | Lowest price including shipping |
| `sellers` | `25` | Number of sellers |
| `listings` | `36` | Number of active listings |
| `imageCount` | `1` | Number of product images |
| `customAttributes.description` | `"Rise to a New Challenge!..."` | Product description (HTML) |
| `customAttributes.releaseDate` | `"2026-01-30T00:00:00Z"` | Release date |
| `skus` | `[{"sku": 9102084, ...}]` | SKU variants (condition, language, variant) |

**Product Image URL:** `https://tcgplayer-cdn.tcgplayer.com/product/{productId}_in_1000x1000.jpg`

---

## Pricing

### Market Price by SKU

Get current market price, lowest, and highest for specific SKUs.

```
POST https://mpgateway.tcgplayer.com/v1/pricepoints/marketprice/skus/search
```

**Request Body:**

```json
{
  "skuIds": [9102084]
}
```

**Response:**

```json
[
  {
    "skuId": 9102084,
    "marketPrice": 11.74,
    "lowestPrice": 10.99,
    "highestPrice": 13,
    "priceCount": 25,
    "calculatedAt": "2026-04-15T06:30:05.605Z"
  }
]
```

### Price History

Get historical price data with daily buckets.

```
GET https://infinite-api.tcgplayer.com/price/history/{productId}/detailed?range={range}
```

| Param | Values |
|---|---|
| `range` | `quarter`, `annual`, `all` |

**Response Fields (per bucket):**

| Field | Description |
|---|---|
| `marketPrice` | Market price for that period |
| `quantitySold` | Units sold |
| `transactionCount` | Number of transactions |
| `lowSalePrice` | Lowest sale price |
| `highSalePrice` | Highest sale price |
| `lowSalePriceWithShipping` | Lowest sale price including shipping |
| `highSalePriceWithShipping` | Highest sale price including shipping |
| `bucketStartDate` | Start date of the bucket (e.g. `"2026-04-13"`) |

Also returns summary fields: `averageDailyQuantitySold`, `averageDailyTransactionCount`, `totalQuantitySold`, `totalTransactionCount`.

### Price Volatility

Get the volatility rating for a SKU.

```
GET https://mpgateway.tcgplayer.com/v1/pricepoints/marketprice/skus/{skuId}/volatility
```

**Response:**

```json
{
  "skuId": 9102084,
  "zScore": 0.5,
  "volatility": "MED"
}
```

### Buylist Market Price

Get the buylist (sell-to-store) market price.

```
GET https://mpgateway.tcgplayer.com/v1/pricepoints/buylist/marketprice/products/{productId}
```

**Response:**

```json
[
  {
    "skuId": 9102084,
    "marketPrice": null,
    "highPrice": null,
    "calculatedAt": null
  }
]
```

---

## Listings & Sales

### Seller Listings

Get individual seller listings for a product, sorted by price.

```
POST https://mp-search-api.tcgplayer.com/v1/product/{productId}/listings
```

**Request Body:**

```json
{
  "filters": {
    "term": { "sellerStatus": "Live", "channelId": 0, "language": ["English"] },
    "range": { "quantity": { "gte": 1 } },
    "exclude": { "channelExclusion": 0 }
  },
  "from": 0,
  "size": 10,
  "sort": { "field": "price+shipping", "order": "asc" },
  "context": { "shippingCountry": "US", "cart": {} },
  "aggregations": ["listingType"]
}
```

**Response Fields (per listing):**

| Field | Description |
|---|---|
| `sellerName` | Seller display name |
| `sellerPrice` | Listed price |
| `sellerShippingPrice` | Shipping cost |
| `quantity` | Available quantity |
| `goldSeller` | Gold Star seller status |
| `verifiedSeller` | Verified seller status |
| `condition` | Card condition |
| `printing` | Normal / Foil |
| `language` | Language |

### Latest Sales

Get the most recent completed sales.

```
POST https://mpapi.tcgplayer.com/v2/product/{productId}/latestsales
```

**Request Body:**

```json
{
  "limit": 25
}
```

**Response Fields (per sale):**

| Field | Example |
|---|---|
| `purchasePrice` | `13.0` |
| `shippingPrice` | `0.0` |
| `quantity` | `10` |
| `orderDate` | `"2026-04-15T06:28:47.607+00:00"` |
| `condition` | `"Unopened"` |
| `variant` | `"Normal"` |
| `language` | `"English"` |
| `listingType` | `"ListingWithoutPhotos"` |

### Spotlight (Featured Seller)

Get the featured/spotlight listing shown on the product page.

```
POST https://data.tcgplayer.com/spotlight/search/{productId}
```

**Request Body:**

```json
{
  "context": { "cart": { "packages": {} } }
}
```

**Response:** Single listing with seller info, price, rating, quantity, and location.
