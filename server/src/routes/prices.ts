import { Router, Request, Response } from 'express';

const router = Router();

const TCGPLAYER_HEADERS = {
  Origin: 'https://www.tcgplayer.com',
  Referer: 'https://www.tcgplayer.com/',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

router.get('/', async (req: Request, res: Response) => {
  const { name, setName, localId } = req.query as Record<string, string>;

  if (!name) return res.status(400).json({ error: 'name is required' });

  const searchRes = await fetch(
    `https://mp-search-api.tcgplayer.com/v1/search/request?q=${encodeURIComponent(name)}&isList=false`,
    {
      method: 'POST',
      headers: TCGPLAYER_HEADERS,
      body: JSON.stringify({
        algorithm: 'sales_exp_fields_boosting',
        from: 0,
        size: 20,
        filters: {
          term: { productLineName: ['Pokemon'], productTypeName: ['Cards'] },
          range: {},
          match: {},
        },
        listingSearch: {
          filters: {
            term: { sellerStatus: 'Live', channelId: 0 },
            range: { quantity: { gte: 1 } },
            exclude: { channelExclusion: 0 },
          },
          context: { cart: {} },
        },
      }),
    }
  );

  if (!searchRes.ok) return res.status(502).json({ error: 'TCGPlayer search failed' });

  const json = await searchRes.json() as any;
  const results: any[] = json.results?.[0]?.results ?? [];

  if (results.length === 0) return res.json(null);

  let match = results[0];

  if (setName) {
    const setLower = setName.toLowerCase();
    const setMatches = results.filter(
      (r) =>
        r.setName?.toLowerCase().includes(setLower) ||
        setLower.includes(r.setName?.toLowerCase() ?? '')
    );
    if (setMatches.length > 0) {
      match = setMatches[0];
      if (localId) {
        const numberMatch = setMatches.find((r) => r.productName?.includes(localId));
        if (numberMatch) match = numberMatch;
      }
    }
  }

  return res.json({
    marketPrice: match.marketPrice ?? null,
    lowestPrice: match.lowestPrice ?? null,
    productId: match.productId,
    productUrl: `https://www.tcgplayer.com/product/${match.productId}?Language=English`,
  });
});

export default router;
