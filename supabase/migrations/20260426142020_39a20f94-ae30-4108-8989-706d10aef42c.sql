-- Distribute existing active offers across multiple merchants for variety
WITH active_offers AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM public.offers
  WHERE status = 'active' AND expires_at >= now()
),
merchant_list AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) AS rn,
         (SELECT COUNT(*) FROM public.merchants) AS total
  FROM public.merchants
)
UPDATE public.offers o
SET merchant_id = ml.id
FROM active_offers ao
JOIN merchant_list ml ON ml.rn = ((ao.rn - 1) % (SELECT COUNT(*) FROM public.merchants)) + 1
WHERE o.id = ao.id;