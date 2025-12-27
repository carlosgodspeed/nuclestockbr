-- Add optional contact fields for suppliers and customers
ALTER TABLE public.movements 
ADD COLUMN IF NOT EXISTS supplier_phone TEXT,
ADD COLUMN IF NOT EXISTS supplier_email TEXT,
ADD COLUMN IF NOT EXISTS supplier_notes TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_notes TEXT;